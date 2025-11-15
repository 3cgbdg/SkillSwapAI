import { LayoutDashboard, Users, LibraryBig, MessageSquare, Calendar, User } from "lucide-react";

export const navLinks = [
    { title: "Dashboard", link: "/dashboard", icon: <LayoutDashboard /> },
    { title: "Matches", link: "/matches", icon: <Users /> },
    { title: "Active Matches", link: "/matches/active", icon: <LibraryBig /> },
    { title: "Chat", link: "/chats", icon: <MessageSquare /> },
    { title: "Calendar", link: "/calendar", icon: <Calendar /> },
    { title: "My Profile", link: "/profile", icon: <User /> },
];