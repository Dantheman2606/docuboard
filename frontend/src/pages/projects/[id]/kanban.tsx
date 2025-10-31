import { useRouter } from "next/router";
import { useEffect } from "react";

export default function KanbanRedirectPage() {
  const router = useRouter();
  const { id } = router.query;
  
  useEffect(() => {
    if (id) {
      // Redirect to the new kanban boards index page
      router.replace(`/projects/${id}/kanban`);
    }
  }, [id, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
