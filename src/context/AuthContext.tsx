// One DSD Equity Platform - Authentication Context
// Microsoft Entra ID (Azure AD) authentication via Supabase OAuth
// Server-side token validation via Supabase Edge Function

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseAvailable } from "@/core/supabaseClient";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isAdmin: boolean;
  avatarUrl?: string;
  accessToken?: string;
}

export type UserRole =
  | "equity-consultant"   // ROLE-001: Full admin
  | "leadership-reviewer" // ROLE-002: Approver
  | "program-manager"     // ROLE-003: Editor
  | "content-owner"       // ROLE-004: Contributor
  | "education-owner"     // ROLE-005: Contributor
  | "data-steward"        // ROLE-006: Analyst
  | "staff";              // Default role

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Admin emails - matches existing auth.js config
const ADMIN_EMAILS = [
  "gary.bellows@state.mn.us",
  "garybellows@outlook.com",
  "garybellows@hotmail.com",
];

function resolveRole(email: string): UserRole {
  if (ADMIN_EMAILS.some(a => a.toLowerCase() === email.toLowerCase())) {
    return "equity-consultant";
  }
  // Default role for authenticated state users
  if (email.endsWith("@state.mn.us")) {
    return "program-manager";
  }
  return "staff";
}

function isLocalDev(): boolean {
  return (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate token server-side via Supabase Edge Function
  const validateToken = useCallback(async (): Promise<boolean> => {
    if (!isSupabaseAvailable() || !supabase) return false;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return false;

      const { data, error: fnError } = await supabase.functions.invoke("validate-token", {
        body: { token: session.access_token },
      });

      if (fnError) {
        console.error("Token validation error:", fnError);
        return false;
      }

      return data?.valid === true;
    } catch (err) {
      console.error("Token validation failed:", err);
      return false;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      // Local dev bypass - full admin access
      if (isLocalDev()) {
        if (mounted) {
          setUser({
            id: "local-dev",
            email: "admin@localhost",
            name: "Program Owner (Dev)",
            role: "equity-consultant",
            isAdmin: true,
          });
          setIsLoading(false);
        }
        return;
      }

      if (!isSupabaseAvailable() || !supabase) {
        if (mounted) {
          setError("Authentication service unavailable. Supabase is not configured.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const email = session.user.email || "";
          const role = resolveRole(email);
          if (mounted) {
            setUser({
              id: session.user.id,
              email,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || email,
              role,
              isAdmin: role === "equity-consultant" || role === "leadership-reviewer",
              avatarUrl: session.user.user_metadata?.avatar_url,
              accessToken: session.access_token,
            });
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        if (mounted) {
          setError("Failed to initialize authentication");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Listen for auth state changes
    let subscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseAvailable() && supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const email = session.user.email || "";
          const role = resolveRole(email);
          setUser({
            id: session.user.id,
            email,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || email,
            role,
            isAdmin: role === "equity-consultant" || role === "leadership-reviewer",
            avatarUrl: session.user.user_metadata?.avatar_url,
            accessToken: session.access_token,
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Login with Microsoft Entra ID via Supabase OAuth
  const login = useCallback(async () => {
    if (!isSupabaseAvailable() || !supabase) {
      setError("Supabase is not configured. Cannot authenticate.");
      return;
    }

    setError(null);
    const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          scopes: "openid profile email User.Read",
          queryParams: tenantId
            ? { tenant: tenantId }
            : undefined,
          redirectTo: window.location.origin,
        },
      });

      if (authError) {
        setError(authError.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    if (!isSupabaseAvailable() || !supabase) return;

    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        error,
        login,
        logout,
        validateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
