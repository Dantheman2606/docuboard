import { useRouter } from "next/router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useUIStore } from "@/stores/uiStore";

export default function DashboardPage() {
  const router = useRouter();
  const { data: projects = [] } = useProjects();

  const {currentProjectId, setCurrentProject} = useUIStore();

  function projectSelect(projectId: string): void {
    setCurrentProject(projectId)
    router.push(`/projects/${projectId}/`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r pb-3 from-slate-800 to-sky-700 bg-clip-text text-transparent">
              Your Projects
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Select a project to open its workspace
            </p>
          </div>

          <Button
            onClick={() => alert("Project creation not implemented yet")}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white shadow-lg shadow-sky-200/50 px-6 py-5 transition-all duration-200"
          >
            <PlusCircle size={20} />
            New Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <div className="p-8 rounded-full bg-sky-50">
              <PlusCircle size={48} className="text-sky-600" />
            </div>
            <p className="text-xl font-medium text-slate-700">No projects yet</p>
            <p className="text-slate-500">Start by creating a new project</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer border border-slate-200/80 bg-white/80 backdrop-blur-sm"
                onClick={() => projectSelect(project.id)}
              >
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-slate-800 group-hover:text-sky-700 transition-colors">
                    {project.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {project.description || "No description provided"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
