'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const pathname = usePathname();

  // Close sidebar on navigation on mobile sizes
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  // Adjust sidebar state relative to window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && sidebarOpen) setSidebarOpen(false);
      else if (window.innerWidth >= 1024 && !sidebarOpen) setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 relative">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar logic */}
      <div 
        className={cn(
          'transition-transform duration-300 ease-in-out fixed lg:relative h-full shrink-0 z-40',
          sidebarOpen ? 'translate-x-0 w-64 lg:w-60 shadow-2xl lg:shadow-none' : '-translate-x-full lg:translate-x-0 lg:w-0 w-64 lg:overflow-hidden shadow-none'
        )}
      >
        <div className="w-64 lg:w-60 h-full">
          <Sidebar />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative z-10 w-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
