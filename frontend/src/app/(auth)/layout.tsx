import { AuthBackdrop } from "@/components/composites/AuthBackdrop";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center py-2">
      <AuthBackdrop />
      <div id="main-content" className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
