// Admin shell: dark emerald base, responsive sidebar nav, brass primary actions, Outlet.
// Visual conventions per docs/frontend-spec.md §8.

import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/blogs', label: 'Blogs' },
  { to: '/admin/properties', label: 'Properties' },
  { to: '/admin/enquiries', label: 'Enquiries' },
  { to: '/admin/newsletter', label: 'Newsletter' },
  { to: '/admin/curations', label: 'Curations' },
  { to: '/admin/advisors', label: 'Advisors' },
  { to: '/admin/settings', label: 'Settings' },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-emerald text-parchment">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-emerald/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - fixed on desktop, overlay on mobile */}
      <aside
        className={
          'fixed inset-y-0 left-0 z-40 w-56 border-r border-parchment/10 bg-emerald-darker ' +
          'transform transition-transform duration-300 ease-in-out ' +
          'md:translate-x-0 ' +
          (sidebarOpen ? 'translate-x-0' : '-translate-x-full')
        }
      >
        <div className="px-5 py-6">
          <span className="font-display text-xl text-parchment">Sterling Gates</span>
          <span className="mt-1 block text-[0.55rem] uppercase tracking-[0.3em] text-gold">
            Admin
          </span>
        </div>
        <nav className="mt-2 flex flex-col gap-1 px-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 text-[0.75rem] uppercase tracking-[0.15em] transition-colors ${
                  isActive ? 'bg-emerald-light text-brass' : 'text-parchment/60 hover:text-parchment'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content - margin only on desktop */}
      <div className="flex min-h-screen flex-1 flex-col md:ml-56">
        <header className="flex items-center justify-between border-b border-parchment/10 px-5 py-4 md:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="rounded-full border border-parchment/15 p-2 text-parchment transition-colors hover:border-brass hover:text-brass md:hidden"
              aria-label="Toggle menu"
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
            <span className="text-xs uppercase tracking-[0.2em] text-parchment/50">
              Back office
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-parchment/60">{user?.email}</span>
            <button
              onClick={() => void signOut()}
              className="text-xs uppercase tracking-[0.15em] text-brass hover:text-parchment"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
