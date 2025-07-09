"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GamificationProvider } from "@/contexts/GamificationContext";
import { UserRoleProvider } from "@/contexts/UserRoleContext";
import { StateErrorBoundary } from "@/components/error-boundary";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <StateErrorBoundary>
        <LanguageProvider>
          <UserRoleProvider>
            <GamificationProvider>
              {children}
            </GamificationProvider>
          </UserRoleProvider>
        </LanguageProvider>
      </StateErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}