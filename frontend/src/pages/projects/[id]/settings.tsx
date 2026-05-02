import { useRouter } from "next/router";
import Head from "next/head";
import Layout from "@/components/Layout";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ProjectMember, ProjectJoinRequest } from "@/lib/api";
import { useProject } from "@/hooks/useProject";
import { useUIStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

const roleOptions: ProjectMember["role"][] = ["admin", "editor", "viewer"];

export default function ProjectSettingsPage() {
  const router = useRouter();
  const { id } = router.query;
  const projectId = typeof id === "string" ? id : "";

  const [activeTab, setActiveTab] = useState<"members" | "requests">("members");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteName, setDeleteName] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { setCurrentProject } = useUIStore();

  const { data: project, isLoading: projectLoading, isError: projectError } = useProject(projectId);

  const {
    data: joinRequests = [],
    isLoading: requestsLoading,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ["project-requests", projectId],
    queryFn: () => api.getProjectJoinRequests(projectId),
    enabled: !!projectId && project?.userRole === "owner",
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: "always",
    refetchOnMount: "always",
    refetchInterval: 1000 * 5,
  });

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);

  useEffect(() => {
    if (project && project.userRole !== "owner") {
      toast.error("Only the project owner can access project settings.");
      router.replace("/dashboard");
    }
  }, [project, router]);

  useEffect(() => {
    if (activeTab === "requests" && project?.userRole === "owner") {
      refetchRequests();
    }
  }, [activeTab, project?.userRole, refetchRequests]);

  const members = useMemo(() => {
    return (project?.members || []).slice().sort((a, b) => {
      if (a.role === "owner") return -1;
      if (b.role === "owner") return 1;
      return a.username.localeCompare(b.username);
    });
  }, [project?.members]);

  const handleRoleChange = async (memberId: string, role: ProjectMember["role"]) => {
    try {
      await api.updateProjectMember(projectId, memberId, role);
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Role updated.");
    } catch (error: any) {
      toast.error(error.message || "Failed to update role.");
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await api.approveProjectJoinRequest(projectId, userId);
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["project-requests", projectId] });
      toast.success("Member approved.");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve request.");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await api.removeProjectMember(projectId, userId);
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Member removed.");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member.");
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;

    if (deleteName.trim() !== project.name.trim()) {
      setDeleteError("Project name does not match.");
      return;
    }

    if (!deletePassword.trim()) {
      setDeleteError("Password is required.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await api.deleteProject(projectId, { name: deleteName.trim(), password: deletePassword });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted.");
      router.replace("/dashboard");
    } catch (error: any) {
      setDeleteError(error.message || "Failed to delete project.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await api.rejectProjectJoinRequest(projectId, userId);
      await queryClient.invalidateQueries({ queryKey: ["project-requests", projectId] });
      toast.success("Request rejected.");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject request.");
    }
  };

  if (projectLoading || requestsLoading) {
    return (
      <>
        <Head>
          <title>Project Settings - Docuboard</title>
        </Head>
        <Layout>
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </Layout>
      </>
    );
  }

  if (projectError || !project) {
    return (
      <>
        <Head>
          <title>Project Settings - Docuboard</title>
        </Head>
        <Layout>
          <div className="flex items-center justify-center h-screen">
            <div className="text-gray-600">Project not found.</div>
          </div>
        </Layout>
      </>
    );
  }

  const projectCode = project.projectCode || "--------";

  return (
    <>
      <Head>
        <title>Project Settings - {project.name} - Docuboard</title>
      </Head>
      <Layout>
        <div className="min-h-screen bg-white p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-black">Project Settings</h1>
                <p className="text-gray-600 mt-1">Manage members and access requests.</p>
              </div>
              <Card className="border-2 border-gray-200 bg-gray-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Project Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono tracking-widest text-black">
                    {projectCode}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Share this code to request access.</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg text-red-700">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-black">Delete this project</div>
                  <div className="text-sm text-red-700">This action cannot be undone.</div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  Delete Project
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                variant={activeTab === "members" ? "default" : "outline"}
                onClick={() => setActiveTab("members")}
                className={activeTab === "members" ? "bg-black text-white" : "border-2"}
              >
                Members
              </Button>
              <Button
                variant={activeTab === "requests" ? "default" : "outline"}
                onClick={() => setActiveTab("requests")}
                className={activeTab === "requests" ? "bg-black text-white" : "border-2"}
              >
                Requests ({joinRequests.length})
              </Button>
            </div>

            {activeTab === "members" && (
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Project Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members.length === 0 && (
                      <div className="text-gray-500">No members found.</div>
                    )}
                    {members.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center justify-between gap-4 border-2 border-gray-100 p-3"
                      >
                        <div>
                          <div className="font-medium text-black">
                            {member.name || member.username}
                          </div>
                          <div className="text-sm text-gray-500">@{member.username}</div>
                        </div>
                        {member.role === "owner" ? (
                          <div className="text-sm font-semibold text-black">Owner</div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Select
                              value={member.role}
                              onValueChange={(value) => handleRoleChange(member.userId, value as ProjectMember["role"])}
                            >
                              <SelectTrigger className="w-[160px] border-2 border-gray-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {roleOptions.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              className="border-2 text-red-600 hover:text-red-700"
                              onClick={() => handleRemoveMember(member.userId)}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "requests" && (
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Access Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {joinRequests.length === 0 && (
                      <div className="text-gray-500">No pending requests.</div>
                    )}
                    {joinRequests.map((request: ProjectJoinRequest) => (
                      <div
                        key={request.userId}
                        className="flex items-center justify-between gap-4 border-2 border-gray-100 p-3"
                      >
                        <div>
                          <div className="font-medium text-black">
                            {request.name || request.username}
                          </div>
                          <div className="text-sm text-gray-500">@{request.username}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="bg-black text-white"
                            onClick={() => handleApprove(request.userId)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="border-2"
                            onClick={() => handleReject(request.userId)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Layout>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[520px] border-2 border-red-600">
          <DialogHeader>
            <DialogTitle className="text-red-700">Delete Project</DialogTitle>
            <DialogDescription className="text-gray-600">
              Type the project name and your password to confirm deletion.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {deleteError && (
              <div className="p-3 text-sm text-red-700 bg-red-100 border-2 border-red-600">
                {deleteError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-black">Project Name</label>
              <Input
                value={deleteName}
                onChange={(e) => setDeleteName(e.target.value)}
                placeholder={project?.name || "Project name"}
                className="h-11 border-2 border-gray-300 focus:border-red-600 focus:ring-0"
                disabled={isDeleting}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-black">Owner Password</label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                className="h-11 border-2 border-gray-300 focus:border-red-600 focus:ring-0"
                disabled={isDeleting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setDeleteName("");
                setDeletePassword("");
                setDeleteError("");
              }}
              className="border-2"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
