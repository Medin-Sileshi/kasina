"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { PwaRegister } from "@/components/pwa-register";
import { registerOfflineSync } from "@/lib/offline-session/register-sync";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (error instanceof Error && "status" in error) {
                const status = (error as Error & { status?: number }).status;
                if (status === 401 || status === 403) return false;
              }
              return failureCount < 1;
            },
          },
        },
      }),
  );

  useEffect(() => {
    registerOfflineSync();
  }, []);

  return (
    <QueryClientProvider client={client}>
      <PwaRegister />
      {children}
    </QueryClientProvider>
  );
}
