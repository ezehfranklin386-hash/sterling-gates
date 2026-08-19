// Admin shell: dark emerald base, sidebar nav, brass primary actions, Outlet.
// Visual conventions per docs/frontend-spec.md §8.

import { NavLink, Outlet } from 'react-router-dom';
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

  return (
    <div className="flex min-h-screen bg-emerald text-parchment">
      <aside className="fixed inset-y-0 left-0 z-40 w-56 border-r border-parchment/10 bg-emerald-darker">
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

      <div className="ml-56 flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-parchment/10 px-8 py-4">
          <span className="text-xs uppercase tracking-[0.2em] text-parchment/50">
            Back office
          </span>
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
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}