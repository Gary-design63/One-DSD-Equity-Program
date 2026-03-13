import { useState, useEffect } from 'react';
import type { User } from '../types';

const ADMIN_EMAILS = [
  'gary.bellows@state.mn.us',
  'garybellows@outlook.com',
  'garybellows@hotmail.com',
];

function isAdminEmail(email: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.some(a => a.toLowerCase() === email.toLowerCase());
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Localhost bypass — full admin access
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    ) {
      setUser({ name: 'Program Owner', email: 'admin@localhost', isAdmin: true });
      setLoading(false);
      return;
    }

    // Listen for the auth:ready event dispatched by auth.js
    const handleAuthReady = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.user) {
        setUser(detail.user);
      }
      setLoading(false);
    };

    window.addEventListener('auth:ready', handleAuthReady);

    // If AUTH is already initialized, try to get user immediately
    if (window.AUTH) {
      const u = window.AUTH.getUser();
      if (u) {
        setUser(u);
        setLoading(false);
      } else {
        // Not authenticated — auth.js will redirect to login
        setLoading(false);
      }
    } else {
      // auth.js hasn't loaded yet — wait a bit then check
      const timer = setTimeout(() => {
        if (window.AUTH) {
          const u = window.AUTH.getUser();
          if (u) setUser(u);
        }
        setLoading(false);
      }, 1000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('auth:ready', handleAuthReady);
      };
    }

    return () => {
      window.removeEventListener('auth:ready', handleAuthReady);
    };
  }, []);

  const login = () => {
    if (window.AUTH) {
      window.AUTH.login();
    }
  };

  const logout = () => {
    if (window.AUTH) {
      window.AUTH.logout();
    } else {
      setUser(null);
    }
  };

  return { user, loading, login, logout };
}

export { isAdminEmail };
