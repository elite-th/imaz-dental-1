"use client";

import {
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n/context";
import type { TabKey } from "../types";

export interface SidebarItem {
  key: TabKey;
  icon: LucideIcon;
  label: string;
}

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileMenuOpen: boolean;
  onCloseMobile: () => void;
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  sidebarItems: SidebarItem[];
  adminInitial: string;
  adminDisplayName: string;
  adminEmail: string;
  onLogout: () => void;
  isRTL: boolean;
  isDesktop: boolean;
}

export function getSidebarWidth(collapsed: boolean): number {
  return collapsed ? 80 : 260;
}

export function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileMenuOpen,
  onCloseMobile,
  activeTab,
  onSelectTab,
  sidebarItems,
  adminInitial,
  adminDisplayName,
  adminEmail,
  onLogout,
  isRTL,
}: AdminSidebarProps) {
  const { t } = useI18n();
  const sidebarWidth = getSidebarWidth(collapsed);

  return (
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={onCloseMobile} />
      )}

      <aside
        className={`fixed top-0 ${isRTL ? "right-0" : "left-0"} z-50 h-screen transition-all duration-300 ease-in-out flex flex-col ${
          mobileMenuOpen ? "translate-x-0" : isRTL ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          width: sidebarWidth,
          background: "linear-gradient(180deg, #071E1B 0%, #0D3A35 40%, #0D3A35 100%)",
        }}
      >
        {/* Logo area */}
        <div className="h-[72px] flex items-center px-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.1)" }}>
              <img src="/images/imaz-logo-new.svg" alt="ایماز" className="h-6 w-auto brightness-0 invert" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h3 className="text-white text-sm font-bold truncate" style={{ fontFamily: "var(--font-vazirmatn)" }}>ایماز دنتال</h3>
                <p className="text-teal-400/50 text-[10px]" style={{ fontFamily: "var(--font-vazirmatn)" }}>پنل مدیریت</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-white/[0.12] text-white shadow-lg shadow-black/10"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-teal-300" : ""}`} />
                {!collapsed && (
                  <span className="text-[13px] font-medium truncate" style={{ fontFamily: "var(--font-vazirmatn)" }}>{item.label}</span>
                )}
                {isActive && !collapsed && <div className="ms-auto w-1.5 h-1.5 rounded-full bg-teal-400" />}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden lg:block px-3 py-4 border-t border-white/[0.06]">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
          >
            {collapsed ? (
              isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            )}
            {!collapsed && <span className="text-[11px]" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.collapse_sidebar")}</span>}
          </button>
        </div>

        {/* User section */}
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", color: "white" }}>
              {adminInitial}
            </div>
            {!collapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-white text-xs font-bold truncate" style={{ fontFamily: "var(--font-vazirmatn)" }}>{adminDisplayName}</p>
                <p className="text-teal-400/40 text-[10px]" style={{ fontFamily: "var(--font-vazirmatn)" }}>{adminEmail}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={onLogout} className="text-white/20 hover:text-rose-400 transition-colors" title={t("admin.logout")}>
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
