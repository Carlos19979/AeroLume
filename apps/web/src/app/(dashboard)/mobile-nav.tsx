'use client';

import { useState } from 'react';

type NavLink = { href: string; label: string };

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
        aria-label="Abrir menú"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? (
            <>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-0 left-0 w-64 h-full bg-[var(--navy,#0a2540)] text-white z-50 shadow-xl">
            <div className="flex h-16 items-center px-6 justify-between">
              <span className="text-xl font-semibold">Aerolume</span>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="4" y1="16" x2="16" y2="4" />
                </svg>
              </button>
            </div>
            <nav className="px-4 py-4 space-y-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
