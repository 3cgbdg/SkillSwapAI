import Image from "next/image";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="py-2 flex items-center justify-center min-h-screen">
      <div className="fixed size-full inset-0 opacity-20 pointer-events-none">
        <Image
          className="object-contain"
          src={"/authBG.png"}
          fill
          alt="logo icon"
        />
      </div>
      {children}
    </div>
  );
}
