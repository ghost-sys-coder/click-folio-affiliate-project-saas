import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CreditCard,
  FileText,
  LayoutDashboard,
  Link2,
  Settings,
  Sparkles,
} from "lucide-react";

export type AdminNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

export const adminNavSections: AdminNavSection[] = [
  {
    title: "Workspace",
    items: [
      {
        title: "Overview",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        title: "Affiliate Links",
        href: "/admin/links",
        icon: Link2,
      },
      {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
      {
        title: "Content Studio",
        href: "/admin/content",
        icon: Sparkles,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Billing",
        href: "/admin/billing",
        icon: CreditCard,
      },
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export const adminResourceLinks: AdminNavItem[] = [
  {
    title: "Public Page",
    href: "/",
    icon: FileText,
  },
];
