export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center py-2">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 -left-24 size-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-1/3 -right-20 size-[22rem] rounded-full bg-brand-accent/20 blur-3xl" />
        <div className="absolute -bottom-16 left-1/3 size-[20rem] rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
