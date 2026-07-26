"use client";

export default function MainTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-up flex min-h-0 flex-1 flex-col">
      {children}
    </div>
  );
}
