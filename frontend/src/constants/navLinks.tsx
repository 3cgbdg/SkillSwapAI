import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  User,
} from "lucide-react";

export const navLinks = [
  { title: "Dashboard", link: "/dashboard", icon: <LayoutDashboard /> },
  { title: "Matches", link: "/matches", icon: <Users /> },
  { title: "Chat", link: "/chats", icon: <MessageSquare /> },
  { title: "Calendar", link: "/calendar", icon: <Calendar /> },
  { title: "My Profile", link: "/profile", icon: <User /> },
];

export const mobileNavLinks = [
  { title: "Home", link: "/dashboard", icon: <LayoutDashboard /> },
  { title: "Matches", link: "/matches", icon: <Users /> },
  { title: "Chat", link: "/chats", icon: <MessageSquare /> },
  { title: "Calendar", link: "/calendar", icon: <Calendar /> },
  { title: "Profile", link: "/profile", icon: <User /> },
];
