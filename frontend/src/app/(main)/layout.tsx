import AuthClientUpload from "@/components/AuthClientUpload";
import ComingSessionWarning from "@/components/ComingSessionWarning";
import FriendList from "@/components/friends/FriendList";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import MobileTabBar from "@/components/layout/MobileTabBar";
import Sidebar from "@/components/layout/Sidebar";
import { Container } from "@/components/layout/Container";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <AuthClientUpload />
      <Header />
      <ComingSessionWarning />
      <div className="border-border flex min-h-0 grow items-start border-t">
        <Sidebar />
        <main
          id="main-content"
          className="min-h-0 w-full flex-1 overflow-y-auto pb-20 md:pb-0"
        >
          <Container className="py-2 sm:py-6 md:py-8">{children}</Container>
        </main>
        <FriendList />
      </div>
      <MobileTabBar />
      <Footer />
    </div>
  );
}
