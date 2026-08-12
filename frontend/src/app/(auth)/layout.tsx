import { AuthSplitPane } from "@/components/layouts";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div id="main-content">
      <AuthSplitPane>{children}</AuthSplitPane>
    </div>
  );
}
