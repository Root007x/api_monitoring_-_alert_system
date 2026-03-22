"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Radio, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Alerts overview",
  },
  {
    label: "Trigger Monitor",
    href: "/trigger",
    icon: Radio,
    description: "Submit monitor jobs",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 text-gray-100 shrink-0">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700/60">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white">
          <Radio size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-white leading-none">
            API Monitor
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">Operations Hub</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          Menu
        </p>
        {navItems.map(({ label, href, icon: Icon, description }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                isActive
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-600/30"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
              )}
            >
              <Icon
                size={17}
                className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium leading-none truncate">{label}</p>
                <p className="text-[10px] mt-0.5 text-gray-500 group-hover:text-gray-400 truncate">
                  {description}
                </p>
              </div>
              {isActive && (
                <ChevronRight size={13} className="text-indigo-400 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-700/60">
        <p className="text-[10px] text-gray-600 text-center">
          API Monitor v1.0
        </p>
      </div>
    </aside>
  );
}
