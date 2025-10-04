import Header from "@/components/Header";
import AuthClientUpload from "@/components/AuthClientUpload";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div className="flex flex-col h-screen  ">
      <AuthClientUpload />
      <Header />

      <div className="flex items-start grow-1 border-t-[1px]  border-neutral-300">
        <Sidebar />
        <div className="  sm:py-6 py-2 px-3 md:p-8 w-full">
            {children}
        </div>

      </div>

      <Footer />
    </div >


  );
}







