"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  FolderIcon,
  BriefcaseIcon,
  ChatBubbleLeftIcon,
  UsersIcon,
  ServerIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

const menuItems = [
  { name: "Дашборд", href: "/dashboard", icon: HomeIcon },
  { name: "Проекты", href: "/dashboard/projects", icon: FolderIcon },
  { name: "Фриланс", href: "/dashboard/freelance", icon: BriefcaseIcon },
  { name: "Чаты", href: "/dashboard/chats", icon: ChatBubbleLeftIcon },
  { name: "Команда", href: "/dashboard/team", icon: UsersIcon },
  { name: "Серверы", href: "/dashboard/servers", icon: ServerIcon },
  { name: "Отчёты", href: "/dashboard/reports", icon: DocumentChartBarIcon },
  { name: "Настройки", href: "/dashboard/settings", icon: Cog6ToothIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen bg-card border-r border-border transition-all duration-300 flex flex-col sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-xl font-bold text-primary">ReborDev Hub</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-muted rounded-md transition-colors ml-auto"
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {!collapsed && (
          <div className="text-xs text-muted-foreground">
            <p>ReborDev Hub v1.0</p>
            <p className="mt-1">© 2024 ReborDev</p>
          </div>
        )}
      </div>
    </aside>
  );
}
