import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on connection errors
        const isConnectionError = error instanceof Error && (
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('Network request failed')
        );
        
        if (isConnectionError) {
          console.log('🔌 Connection error detected, using cached data');
          return false;
        }
        
        return failureCount < 1;
      },
    },
  },
});

const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : null,
  key: 'docuboard-query-cache',
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ 
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
