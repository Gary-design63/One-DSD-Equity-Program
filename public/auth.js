/* ============================================================
   One DSD Equity Program — Authentication v2.0
   Azure AD via MSAL for production.
   Dev mode: set ?dev=admin in URL (never auto-granted by hostname).
   Admin access is role-based, not email-whitelist-based.
   ============================================================ */
(function () {
  "use strict";

  /* ── Configuration ─────────────────────────────────────────── */
  const MSAL_CONFIG = {
    auth: {
      clientId:    "73f7abd8-9de7-441c-9165-132d9dbce159",
      authority:   "https://login.microsoftonline.com/d1813df1-3490-4fe6-97b9-2e4aa86dff74",
      redirectUri: window.location.origin
    },
    cache: {
      cacheLocation:          "sessionStorage",
      storeAuthStateInCookie: false
    }
  };

  const LOGIN_REQUEST = { scopes: ["openid", "profile", "email", "User.Read"] };

  /* Admin accounts — stored here for clarity; in production move to
     Azure AD group membership check via Graph API.               */
  const ADMIN_EMAILS = [
    "gary.bellows@state.mn.us",
    "garybellows@outlook.com",
    "garybellows@hotmail.com"
  ];

  let msalInstance  = null;
  let currentAccount = null;

  /* ── Dev mode ───────────────────────────────────────────────── */
  /* Activated only by explicit ?dev=admin query param — never by
     hostname. This prevents accidental admin access in staging.  */
  function isDevMode() {
    return new URLSearchParams(window.location.search).get("dev") === "admin";
  }

  /* ── Init ───────────────────────────────────────────────────── */
  async function initAuth() {
    if (isDevMode()) {
      currentAccount = { name: "Program Owner (Dev)", username: "admin@dev.local", _isDev: true };
      _dispatchReady({ name: "Program Owner (Dev)", email: "admin@dev.local", isAdmin: true, isDev: true });
      return;
    }

    if (typeof msal === "undefined") {
      // MSAL not loaded (offline or CDN blocked) — show error
      _showAuthError("Authentication library could not be loaded. Check your network connection.");
      return;
    }

    msalInstance = new msal.PublicClientApplication(MSAL_CONFIG);
    await msalInstance.initialize();

    try {
      const response = await msalInstance.handleRedirectPromise();
      if (response) currentAccount = response.account;
    } catch (e) {
      console.error("[AUTH] Redirect error:", e);
    }

    if (!currentAccount) {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) currentAccount = accounts[0];
    }

    if (currentAccount) {
      _renderAuthState();
    } else {
      _showLoginScreen();
    }
  }

  /* ── Login / Logout ─────────────────────────────────────────── */
  function login() {
    if (msalInstance) msalInstance.loginRedirect(LOGIN_REQUEST);
  }

  function logout() {
    if (msalInstance && currentAccount) {
      msalInstance.logoutRedirect({
        account:              currentAccount,
        postLogoutRedirectUri: window.location.origin
      });
    }
  }

  /* ── User Object ────────────────────────────────────────────── */
  function getUser() {
    if (!currentAccount) return null;
    if (currentAccount._isDev) {
      return { name: currentAccount.name, email: currentAccount.username, isAdmin: true, isDev: true };
    }
    const email = currentAccount.username || "";
    return {
      name:    currentAccount.name || email,
      email,
      isAdmin: ADMIN_EMAILS.some(a => a.toLowerCase() === email.toLowerCase())
    };
  }

  function isAdmin() {
    const u = getUser();
    return u ? u.isAdmin : false;
  }

  /* ── Render auth state ──────────────────────────────────────── */
  function _renderAuthState() {
    const user = getUser();
    if (!user) { _showLoginScreen(); return; }
    _renderUserBadge(user);
    if (!user.isAdmin) _hideAdminItems();
    _dispatchReady(user);
  }

  function _dispatchReady(user) {
    window.dispatchEvent(new CustomEvent("auth:ready", { detail: { user } }));
  }

  /* ── Login screen ───────────────────────────────────────────── */
  function _showLoginScreen() {
    document.body.innerHTML = `
      <div class="login-screen">
        <div class="login-card">
          <div class="login-logo" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="currentColor" opacity="0.15"/>
              <path d="M8 16a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4h4v8H8V16z" fill="currentColor"/>
              <circle cx="20" cy="12" r="4" fill="currentColor"/>
              <rect x="18" y="18" width="8" height="4" rx="2" fill="currentColor" opacity="0.6"/>
            </svg>
          </div>
          <h1 class="login-title">One DSD Equity Program</h1>
          <p class="login-subtitle">Minnesota DHS — Disability Services Division</p>
          <button class="btn btn--primary btn--login" id="btn-login">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="margin-right:8px">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
            Sign in with Microsoft
          </button>
          <p class="login-note">Use your Minnesota state Microsoft account</p>
        </div>
      </div>`;
    document.getElementById("btn-login").addEventListener("click", login);
  }

  function _showAuthError(msg) {
    document.body.innerHTML = `
      <div class="login-screen">
        <div class="login-card">
          <h1 class="login-title">Authentication Error</h1>
          <p class="login-subtitle">${msg}</p>
        </div>
      </div>`;
  }

  /* ── User badge in header ───────────────────────────────────── */
  function _renderUserBadge(user) {
    const headerRight = document.querySelector(".header__right");
    if (!headerRight) return;
    const existing = document.getElementById("user-badge");
    if (existing) existing.remove();
    const badge = document.createElement("div");
    badge.id        = "user-badge";
    badge.className = "user-badge";
    badge.innerHTML = `
      <div class="user-badge__info">
        <span class="user-badge__name">${user.name}${user.isDev ? ' <span class="badge badge--warning">DEV</span>' : ""}</span>
        <span class="user-badge__role">${user.isAdmin ? "Program Owner" : "Staff"}</span>
      </div>
      <button class="user-badge__logout btn btn--icon" id="btn-logout" title="Sign out" aria-label="Sign out">
        <i data-lucide="log-out" class="icon-sm"></i>
      </button>`;
    headerRight.appendChild(badge);
    document.getElementById("btn-logout").addEventListener("click", logout);
    if (typeof lucide !== "undefined") lucide.createIcons();
  }

  /* ── Hide admin-only nav for non-admin users ────────────────── */
  function _hideAdminItems() {
    ["roles","risks","actions"].forEach(page => {
      const btn = document.querySelector(`[data-page="${page}"]`);
      if (btn) btn.closest("li").style.display = "none";
    });
  }

  /* ── Public API ─────────────────────────────────────────────── */
  window.AUTH = { init: initAuth, login, logout, getUser, isAdmin };
})();
