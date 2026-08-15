import AuthClientUpload from "@/components/AuthClientUpload";
import ComingSessionWarning from "@/components/ComingSessionWarning";
import FriendList from "@/components/friends/FriendList";
import Header from "@/components/layout/Header";
import AppSidebar from "@/components/layout/Sidebar";
import { AppShell, AppShellMain } from "@/components/layouts";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider defaultOpen>
      <AppShell
        overlays={
          <>
            <AuthClientUpload />
            <ComingSessionWarning />
            <FriendList />
          </>
        }
        header={<Header />}
        sidebar={<AppSidebar />}
        main={<AppShellMain>{children}</AppShellMain>}
      />
    </SidebarProvider>
  );
}
