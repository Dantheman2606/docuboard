// hooks/useSyncProjectId.ts
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useUIStore } from "@/stores/uiStore";

export function useSyncProjectId() {
  const router = useRouter();
  const { currentProjectId, setCurrentProject } = useUIStore();
  
  useEffect(() => {
    const path = router.asPath; // e.g., /projects/p2/docs/d1
    const match = path.match(/\/projects\/([^/]+)/);
    const idFromUrl = match ? match[1] : null;

    if (idFromUrl && idFromUrl !== currentProjectId) {
      setCurrentProject(idFromUrl);
    }
  }, [router.asPath, currentProjectId, setCurrentProject]);
}
