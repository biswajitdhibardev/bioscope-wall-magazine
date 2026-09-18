'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ADMIN_NAV_LINKS } from '@/lib/constants';
import { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Image,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  QrCode,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Image,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  QrCode,
  Settings
};

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push('/admin/login');
    router.refresh();
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0a] text-[#fafafa]">

      {/* =====================================================
          MOBILE OVERLAY
          ===================================================== */}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />
      )}


      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] bg-[#141414] border-r border-[#262626] transform transition-transform duration-200 ease-in-out lg:translate-x-0",

          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        )}
      >

        <div className="h-full flex flex-col">


          <div className="p-6 flex items-center justify-between shrink-0">

            <div>
              <h2 className="text-xl font-serif text-[#fafafa]">
                Bioscope
              </h2>

              <span className="text-xs text-[#c9a84c] uppercase tracking-wider font-semibold">
                Admin
              </span>
            </div>

            {/* Mobile close button */}
            <button
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
              onClick={() =>
                setMobileMenuOpen(false)
              }
            >
              <X size={20} />
            </button>

          </div>

          

          <nav className="flex-1 min-h-0 px-4 space-y-1 overflow-y-auto">

            {ADMIN_NAV_LINKS?.map((link) => {

              const Icon =
                iconMap[link.icon] ||
                LayoutDashboard;

              const isActive =
                pathname === link.href ||
                (
                  link.href !== '/admin' &&
                  pathname.startsWith(
                    link.href
                  )
                );

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",

                    isActive
                      ? "bg-[#c9a84c]/10 text-[#c9a84c]"
                      : "text-gray-400 hover:text-gray-200 hover:bg-[#262626]/50"
                  )}
                >

                  <Icon
                    size={18}
                    className={
                      isActive
                        ? "text-[#c9a84c]"
                        : ""
                    }
                  />

                  {link.label}

                </Link>
              );
            })}

          </nav>


          <div className="p-4 border-t border-[#262626] shrink-0">

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 w-full transition-colors"
            >
              <LogOut size={18} />

              Sign Out
            </button>

          </div>

        </div>

      </aside>


      <main className="h-screen lg:ml-[260px] flex flex-col min-w-0">

        <header className="h-16 shrink-0 bg-[#141414]/80 backdrop-blur-sm border-b border-[#262626] flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0">

          <div className="flex items-center gap-4">

            {/* Mobile menu button */}
            <button
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() =>
                setMobileMenuOpen(true)
              }
            >
              <Menu size={24} />
            </button>

            <h1 className="text-lg font-medium hidden sm:block">
              Admin Dashboard
            </h1>

          </div>

        </header>


        <div className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-8">

          {children}

        </div>

      </main>

    </div>
  );
}