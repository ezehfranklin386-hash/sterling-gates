// Fixed header: logo + links + "Private Enquiry" CTA + mobile menu.

import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FiArrowUpRight, FiMenu, FiX } from 'react-icons/fi';
import { Monogram, Logo } from '../brand/Brand';
import { Button } from '../ui/primitives';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/properties', label: 'Properties' },
  { to: '/insights', label: 'Insights' },
  { to: '/neighbourhoods', label: 'Neighbourhoods' },
  { to: '/curations', label: 'Curations' },
  { to: '/advisors', label: 'Advisors' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-parchment/10 bg-emerald/75 backdrop-blur-xl supports-[backdrop-filter]:bg-emerald/60">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          {/* Full logo on desktop, monogram only on mobile */}
          <span className="hidden sm:inline-block">
            <Logo className="h-10 w-auto" />
          </span>
          <span className="sm:hidden">
            <Monogram />
          </span>
          <div className="leading-none">
            <span className="block font-display text-lg tracking-wide text-parchment">
              Sterling Gates
            </span>
            <span className="mt-1 block text-[0.55rem] uppercase tracking-[0.35em] text-gold">
              Consultancy &amp; Realty
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-[0.7rem] uppercase tracking-[0.2em] transition-colors ${
                  isActive ? 'text-brass' : 'text-parchment/70 hover:text-brass'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {!isAdmin && (
            <Link to="/contact" className="group">
              <Button>
                Private Enquiry
                <FiArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            </Link>
          )}
        </div>

        <button
          className="flex h-11 w-11 items-center justify-center rounded-full border border-parchment/15 text-parchment transition-colors hover:border-brass hover:text-brass md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-parchment/10 bg-emerald md:hidden">
          <div className="flex flex-col gap-1 px-5 py-4">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-2 text-sm uppercase tracking-[0.2em] text-parchment/80 hover:text-brass"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="px-5 pb-5">
            <Link to="/contact" onClick={() => setOpen(false)} className="block">
              <Button className="w-full">
                Private Enquiry
                <FiArrowUpRight />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}