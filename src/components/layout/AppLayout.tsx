import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { getAppData } from '@/data/appData';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const D = getAppData();
  const reportingPeriod = D?.reportingPeriods?.[0]?.name;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        reportingPeriod={reportingPeriod}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
          user={user}
          onLogout={logout}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Toaster />
    </div>
  );
}
