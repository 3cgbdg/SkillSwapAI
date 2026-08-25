"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactQueryDevtools = dynamic(() =>
  import("@tanstack/react-query-devtools").then((m) => m.ReactQueryDevtools)
);

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 1000 * 30, refetchOnWindowFocus: false },
        },
      })
  );

  // Mounting the devtools only after the client has committed (rather than
  // via ssr:false) keeps it out of both the server render and the client's
  // first render, so it never participates in the hydration diff. A
  // ssr:false dynamic import here was bailing out to full client-side
  // rendering and taking the real page content down with it on every hard
  // reload, even wrapped in its own Suspense boundary. Since this component
  // is never rendered before mount, the dynamic loader is never invoked
  // server-side either, so the devtools chunk still isn't in the initial
  // bundle.
  const [showDevtools, setShowDevtools] = useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV === "development") setShowDevtools(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default QueryProvider;
