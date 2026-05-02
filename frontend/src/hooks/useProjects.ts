// src/hooks/useProjects.ts
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/authStore";

export function useProjects() {
  // Include userId in the query key so each user gets their own cache bucket.
  // This prevents User B from seeing User A's cached projects after a login switch.
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useQuery({
    queryKey: ["projects", userId],
    queryFn: async () => {
      console.log('📡 Fetching projects from backend...');
      const projects = await api.getProjects();
      console.log(`✅ Loaded ${projects.length} project(s) from backend`);
      return projects;
    },
    // Only fetch when a user is authenticated
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    retryDelay: 500,
  });
}