"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Tổng quan", icon: "⌂" },
  { href: "/sessions", label: "Buổi chơi", icon: "◷" },
  { href: "/ranking", label: "Ranking", icon: "▥" },
  { href: "/players", label: "Người chơi", icon: "♙" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,#12312f_0,#07131f_48%,#06101b_100%)] px-0 text-slate-950 sm:px-6">
      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col bg-white shadow-2xl sm:my-8 sm:min-h-[860px] sm:overflow-hidden sm:rounded-[28px]">
        <main className="flex-1 px-5 pb-28 pt-5">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-2 pb-2 pt-1 backdrop-blur sm:absolute sm:left-auto sm:right-auto sm:w-full sm:max-w-md">
          <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-14 flex-col items-center justify-center rounded-xl text-[11px] font-semibold transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  <span className="mt-1 truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
