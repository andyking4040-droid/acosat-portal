"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNav from "@/components/layout/MobileNav";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/certificates", label: "Certificates" },
  { href: "/admin/library", label: "Library" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/reports", label: "Reports" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <MobileNav roleLabel="Administrator" links={adminLinks} />

      <aside className="hidden lg:flex w-64 bg-navy-700 text-white flex-shrink-0 flex-col min-h-screen">
        <div className="p-5 border-b border-navy-600">
          <div className="flex items-center gap-3">
            <img
              src="/acosat-logo.png"
              alt="ACOSAT"
              className="w-10 h-10 object-contain rounded-full bg-white/10 p-0.5"
            />
            <div>
              <div className="font-semibold text-sm leading-tight">
                ACOSAT Portal
              </div>
              <div className="text-xs text-navy-300">Administrator</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
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

        <div className="p-4 border-t border-navy-600">
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-navy-200 hover:bg-white/5 hover:text-white transition"
          >
            Sign Out
          </Link>
        </div>
      </aside>
    </>
  );
}