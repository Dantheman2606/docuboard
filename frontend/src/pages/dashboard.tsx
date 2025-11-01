import { useRouter } from "next/router";
import Head from "next/head";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, LogOut, Edit2 } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useUIStore } from "@/stores/uiStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import type { Project } from "@/lib/api";

const projectColors = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: projects = [] } = useProjects();
  const queryClient = useQueryClient();
  const {currentProjectId, setCurrentProject} = useUIStore();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: projectColors[0],
  });
  const [editProject, setEditProject] = useState({
    name: "",
    description: "",
    color: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  // Check if user is logged in, redirect to landing if not
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.replace("/");
    }
  }, [router]);

  function projectSelect(projectId: string): void {
    setCurrentProject(projectId)
    router.push(`/projects/${projectId}/`)
  }

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      setError("Project name is required");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const created = await api.createProject({
        name: newProject.name.trim(),
        description: newProject.description.trim(),
        color: newProject.color,
      });

      // Invalidate projects query to refetch
      await queryClient.invalidateQueries({ queryKey: ["projects"] });

      // Reset form and close modal
      setNewProject({ name: "", description: "", color: projectColors[0] });
      setIsCreateModalOpen(false);

      // Navigate to new project
      projectSelect(created.id);
    } catch (err: any) {
      setError(err.message || "Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditProject = async () => {
    if (!editProject.name.trim() || !editingProject) {
      setError("Project name is required");
      return;
    }

    setIsUpdating(true);
    setError("");

    try {
      await api.updateProject(editingProject.id, {
        name: editProject.name.trim(),
        description: editProject.description.trim(),
        color: editProject.color,
      });

      // Invalidate projects query to refetch
      await queryClient.invalidateQueries({ queryKey: ["projects"] });

      // Reset form and close modal
      setEditProject({ name: "", description: "", color: "" });
      setEditingProject(null);
      setIsEditModalOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to update project");
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setEditingProject(project);
    setEditProject({
      name: project.name,
      description: project.description,
      color: project.color || projectColors[0],
    });
    setIsEditModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <>
      <Head>
        <title>Dashboard - Docuboard</title>
        <meta name="description" content="Manage your projects and collaborate with your team" />
      </Head>
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

          <div className="flex items-center gap-3">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <LogOut size={18} />
              Logout
            </Button>
            
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white shadow-lg shadow-sky-200/50 px-6 py-5 transition-all duration-200"
            >
              <PlusCircle size={20} />
              New Project
            </Button>
          </div>
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
                className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer border-slate-200/80 bg-white/80 backdrop-blur-sm overflow-hidden"
                onClick={() => projectSelect(project.id)}
                style={{
                  borderLeft: project.color ? `6px solid ${project.color}` : '1px solid rgb(226, 232, 240)',
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      {project.color && (
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                      )}
                      <CardTitle className="text-xl font-semibold text-slate-800 group-hover:text-sky-700 transition-colors">
                        {project.name}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => openEditModal(project, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                    >
                      <Edit2 size={16} />
                    </Button>
                  </div>
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

        {/* Create Project Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new project to organize your documents and tasks.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Project Name *
                </label>
                <Input
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Enter project name"
                  className="h-11"
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>
                <Input
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Enter project description"
                  className="h-11"
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {projectColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewProject({ ...newProject, color })}
                      className={`w-10 h-10 rounded-md transition-all ${
                        newProject.color === color
                          ? "ring-2 ring-slate-400 ring-offset-2 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      disabled={isCreating}
                    />
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewProject({ name: "", description: "", color: projectColors[0] });
                  setError("");
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={isCreating}
                className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700"
              >
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Project Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update your project details and settings.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Project Name *
                </label>
                <Input
                  value={editProject.name}
                  onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                  placeholder="Enter project name"
                  className="h-11"
                  disabled={isUpdating}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>
                <Input
                  value={editProject.description}
                  onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                  placeholder="Enter project description"
                  className="h-11"
                  disabled={isUpdating}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {projectColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditProject({ ...editProject, color })}
                      className={`w-10 h-10 rounded-md transition-all ${
                        editProject.color === color
                          ? "ring-2 ring-slate-400 ring-offset-2 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      disabled={isUpdating}
                    />
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditProject({ name: "", description: "", color: "" });
                  setEditingProject(null);
                  setError("");
                }}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditProject}
                disabled={isUpdating}
                className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700"
              >
                {isUpdating ? "Updating..." : "Update Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </>
  );
}
