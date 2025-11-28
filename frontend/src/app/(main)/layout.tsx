import AuthClientUpload from "@/components/AuthClientUpload";
import ComingSessionWarning from "@/components/ComingSessionWarning";
import FriendList from "@/components/friends/FriendList";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen relative  ">
      <AuthClientUpload />
      <Header />
      <ComingSessionWarning />
      <div className="flex items-start grow-1 border-t-[1px]  border-neutral-300">
        <Sidebar />
        <div className="  sm:py-6 py-2 px-3 md:p-8 w-full">{children}</div>
        <FriendList />
      </div>
      <Footer />
    </div>
  );
}
