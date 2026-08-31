// Admin shell: dark emerald base, sidebar nav (drawer on mobile), brass primary
// actions, Outlet. Mobile-first responsive layout.
//
// Desktop: fixed sidebar + main content offset by md:ml-56.
// Mobile: sidebar hidden off-canvas in a slide-over drawer, toggled via header button.

import { useState, useEffect, useCallback } from 'react';
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

function SidebarNav({ onItemClick }: { onItemClick?: () => void }) {
  return (
    <nav className="mt-2 flex flex-col gap-1 px-3">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onItemClick}
          className={({ isActive }) =>
            `px-3 py-2 text-[0.75rem] uppercase tracking-[0.15em] transition-colors ${
              isActive
                ? 'bg-emerald-light text-brass'
                : 'text-parchment/60 hover:text-parchment'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close drawer on Escape (accessibility + good UX).
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    },
    [],
  );

  // Prevent body scroll when mobile drawer is open.
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  // Close drawer on route change (clicking a nav link).
  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="flex min-h-screen bg-emerald text-parchment">
      {/* ---- Desktop sidebar (always fixed, hidden on mobile) ---- */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-56 border-r border-parchment/10 bg-emerald-darker md:block"
        aria-label="Admin navigation"
      >
        <div className="px-5 py-6">
          <span className="font-display text-xl text-parchment">Sterling Gates</span>
          <span className="mt-1 block text-[0.55rem] uppercase tracking-[0.3em] text-gold">
            Admin
          </span>
        </div>
        <SidebarNav />
      </aside>

      {/* ---- Mobile drawer (off-canvas slide-over) ---- */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          mobileNavOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!mobileNavOpen}
        onClick={closeMobileNav}
      >
        <div
          className={`absolute inset-y-0 left-0 z-[60] flex w-64 max-w-[80vw] flex-col border-r border-parchment/10 bg-emerald-darker shadow-xl transition-transform duration-300 ${
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={onKeyDown}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <span className="font-display text-xl text-parchment">Sterling Gates</span>
            <span className="text-[0.55rem] uppercase tracking-[0.3em] text-gold">
              Admin
            </span>
            <button
              type="button"
              onClick={closeMobileNav}
              className="rounded-full p-2 text-parchment/60 hover:text-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
              aria-label="Close menu"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
          <SidebarNav onItemClick={closeMobileNav} />
        </div>
        {/* Click-away overlay */}
        <div className="absolute inset-0 bg-emerald/60" />
      </div>

      {/* ---- Main content — offset only on desktop where sidebar shows ---- */}
      <div className="flex min-h-screen w-full flex-1 flex-col md:ml-56">
        <header className="flex items-center justify-between border-b border-parchment/10 px-3 py-2 md:px-8 md:py-4">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-full p-2 text-parchment/60 hover:text-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass md:hidden"
            aria-label="Open menu"
            aria-expanded={mobileNavOpen}
          >
            <FiMenu className="h-5 w-5" />
          </button>

          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-parchment/50 md:text-xs">
            Back office
          </span>

          <div className="flex items-center gap-2 md:gap-4">
            <span className="truncate text-[0.65rem] text-parchment/60 md:text-xs">
              {user?.email}
            </span>
            <button
              onClick={() => void signOut()}
              className="text-[0.65rem] uppercase tracking-[0.15em] text-brass hover:text-parchment md:text-xs"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 p-3 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
