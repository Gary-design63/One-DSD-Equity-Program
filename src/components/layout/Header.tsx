import React, { useState } from 'react';
import { Menu, Search, Sun, Moon, Bell, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { User } from '@/types';
import { getAppData } from '@/data/appData';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/knowledge-base': 'Knowledge Base',
  '/workflows': 'Workflows',
  '/templates': 'Templates',
  '/metrics': 'Metrics & Reporting',
  '/learning': 'Learning Portal',
  '/assistant': 'AI Agent Team',
  '/roles': 'Roles & Governance',
  '/actions': 'Actions',
  '/risks': 'Risks',
};

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  const match = Object.keys(PAGE_TITLES)
    .filter(k => k !== '/')
    .sort((a, b) => b.length - a.length)
    .find(k => pathname.startsWith(k));
  return match ? PAGE_TITLES[match] : 'Dashboard';
}

interface HeaderProps {
  onMenuClick: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: User | null;
  onLogout: () => void;
}

export function Header({ onMenuClick, theme, toggleTheme, user, onLogout }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const D = getAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ label: string; path: string }>>([]);

  const pageTitle = getPageTitle(location.pathname);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim() || !D) {
      setSearchResults([]);
      return;
    }
    const lower = q.toLowerCase();
    const results: Array<{ label: string; path: string }> = [];

    D.documents?.slice(0, 50).forEach(d => {
      if (d.title.toLowerCase().includes(lower))
        results.push({ label: `📄 ${d.title}`, path: `/knowledge-base/${d.id}` });
    });
    D.workflows?.forEach(w => {
      if (w.name.toLowerCase().includes(lower))
        results.push({ label: `🔀 ${w.name}`, path: `/workflows/${w.id}` });
    });
    D.learningAssets?.forEach(a => {
      if (a.title.toLowerCase().includes(lower))
        results.push({ label: `📚 ${a.title}`, path: `/learning/${a.id}` });
    });

    setSearchResults(results.slice(0, 8));
  };

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center gap-3 px-4 shrink-0 relative z-10">
      {/* Hamburger for mobile */}
      <button
        className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="text-base font-semibold text-gray-900 min-w-0 truncate">
        {pageTitle}
      </h1>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden sm:block">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          className="w-64 pl-9 pr-3 h-8 text-sm rounded-md border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Search…"
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          onBlur={() => setTimeout(() => setSearchResults([]), 200)}
        />
        {searchResults.length > 0 && (
          <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {searchResults.map((r, i) => (
              <button
                key={i}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 truncate"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  navigate(r.path);
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <button
        className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
        onClick={toggleTheme}
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>

      {/* Notifications */}
      <button
        className="relative p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">3</span>
      </button>

      {/* User badge */}
      {user && (
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-gray-900 leading-tight">{user.name}</div>
            <div className="text-xs text-gray-500 leading-tight">{user.isAdmin ? 'Admin' : 'Staff'}</div>
          </div>
          <button
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
}
