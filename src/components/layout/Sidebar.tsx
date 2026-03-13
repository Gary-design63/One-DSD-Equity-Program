import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, GitBranch, FileText, BarChart3,
  GraduationCap, Bot, Users, CheckCircle2, AlertTriangle, X, Server
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { path: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen, adminOnly: false },
  { path: '/workflows', label: 'Workflows', icon: GitBranch, adminOnly: false },
  { path: '/templates', label: 'Templates', icon: FileText, adminOnly: false },
  { path: '/metrics', label: 'Metrics', icon: BarChart3, adminOnly: false },
  { path: '/learning', label: 'Learning', icon: GraduationCap, adminOnly: false },
  { path: '/assistant', label: 'AI Agents', icon: Bot, adminOnly: false },
  { path: '/roles', label: 'Roles', icon: Users, adminOnly: true },
  { path: '/actions', label: 'Actions', icon: CheckCircle2, adminOnly: true },
  { path: '/risks', label: 'Risks', icon: AlertTriangle, adminOnly: true },
  { path: '/deployment', label: 'Deployment', icon: Server, adminOnly: true },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  reportingPeriod?: string;
}

export function Sidebar({ isOpen, onClose, user, reportingPeriod }: SidebarProps) {
  const location = useLocation();

  // Determine which nav items to show based on admin status
  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || (user?.isAdmin ?? false));

  // Check if a path is "active" — account for nested routes
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-30 h-full w-64 flex flex-col',
          'transition-transform duration-200',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: 'linear-gradient(180deg, #003865, #002a4a)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
            <rect width="32" height="32" rx="8" fill="currentColor" opacity="0.15"/>
            <path d="M8 16a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4h4v8H8V16z" fill="currentColor"/>
            <circle cx="20" cy="12" r="4" fill="currentColor"/>
            <rect x="18" y="18" width="8" height="4" rx="2" fill="currentColor" opacity="0.6"/>
          </svg>
          <div className="min-w-0">
            <div className="text-white font-semibold text-sm leading-tight">One DSD</div>
            <div className="text-white/60 text-xs leading-tight">Equity Program</div>
          </div>
          <button
            className="lg:hidden ml-auto text-white/60 hover:text-white"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2" role="navigation" aria-label="Main navigation">
          <ul className="space-y-0.5" role="list">
            {visibleItems.map(item => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                      active
                        ? 'bg-white/15 text-white font-medium'
                        : 'text-white/70 hover:bg-white/7 hover:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10">
          <span className="text-white/50 text-xs">{reportingPeriod || 'Q1 FY2026'}</span>
        </div>
      </aside>
    </>
  );
}
