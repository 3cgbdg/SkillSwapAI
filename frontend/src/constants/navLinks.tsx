import {
  BookOpen,
  Calendar,
  Compass,
  LayoutDashboard,
  MessageSquare,
  User,
} from "lucide-react";
import type { ReactNode } from "react";

export const navLinks: {
  title: string;
  link: string;
  icon: ReactNode;
}[] = [
  { title: "Home", link: "/dashboard", icon: <LayoutDashboard /> },
  { title: "Discover", link: "/discover", icon: <Compass /> },
  { title: "Learning", link: "/learning", icon: <BookOpen /> },
  { title: "Schedule", link: "/schedule", icon: <Calendar /> },
  { title: "Inbox", link: "/inbox", icon: <MessageSquare /> },
  { title: "Profile", link: "/profile", icon: <User /> },
];

export function isNavLinkActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** @deprecated Use isNavLinkActive */
export const isNavActive = isNavLinkActive;
