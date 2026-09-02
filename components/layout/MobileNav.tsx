"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type LinkItem = {
  href: string;
  label: string;
};

export default function MobileNav({
  links,
  roleLabel,
}: {
  links: LinkItem[];
  roleLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Fixed full-width top bar (mobile only) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-navy-700 text-white border-b border-navy-600">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/acosat-logo.png"
              alt="ACOSAT"
              className="w-8 h-8 object-contain rounded-full bg-white/10 p-0.5 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight truncate">
                ACOSAT Portal
              </div>
              <div className="text-[11px] text-navy-300">{roleLabel}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 flex-shrink-0"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Spacer so content is not under the fixed bar */}
      <div className="lg:hidden h-14 flex-shrink-0" />

      {/* Drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          <div className="absolute top-0 left-0 h-full w-[min(280px,85vw)] bg-navy-700 text-white shadow-2xl flex flex-col">
            <div className="p-4 border-b border-navy-600 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src="/acosat-logo.png"
                  alt="ACOSAT"
                  className="w-9 h-9 object-contain rounded-full bg-white/10 p-0.5 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-semibold text-sm leading-tight truncate">
                    ACOSAT Portal
                  </div>
                  <div className="text-xs text-navy-300">{roleLabel}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm transition ${
                      isActive
                        ? "bg-white/10 text-white font-medium"
                        : "text-navy-200 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-navy-600">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm text-navy-200 hover:bg-white/5 hover:text-white transition"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}