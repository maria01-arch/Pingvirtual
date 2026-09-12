"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Smartphone, Wallet } from "lucide-react";

const TABS = [
  { href: "/dashboard/services", label: "Services", icon: LayoutGrid },
  { href: "/dashboard/numbers", label: "My Numbers", icon: Smartphone },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-2xl">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.8}
                className={active ? "text-brand" : "text-slate-400"}
              />
              <span className={active ? "font-medium text-brand" : "text-slate-400"}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
