import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, UserProjectSummary, UserSettingsResponse } from "@/lib/api";
import { useAuth } from "@/features/auth";

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState<UserSettingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    name: "",
  });

  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const data = await api.getUserSettings();
        if (!isMounted) return;
        setSettings(data);
        setFormData({
          username: data.user.username || "",
          name: data.user.name || "",
        });
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || "Failed to load settings");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const projectCount = settings?.projectCount ?? 0;
  const projects = settings?.projects ?? [];

  const hasChanges = useMemo(() => {
    if (!settings) return false;
    return (
      formData.username.trim() !== settings.user.username ||
      formData.name.trim() !== settings.user.name
    );
  }, [formData, settings]);

  const handleSave = async () => {
    if (!settings) return;
    setError("");
    setIsSaving(true);

    try {
      const updated = await api.updateMe({
        username: formData.username.trim(),
        name: formData.name.trim(),
      });

      setSettings({
        ...settings,
        user: updated,
      });

      updateUser({
        id: updated.id,
        username: updated.username,
        email: updated.email,
        name: updated.name,
        role: updated.role,
      });
    } catch (err: any) {
      setError(err.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const renderRoleBadge = (role: UserProjectSummary["role"]) => {
    const styles: Record<typeof role, string> = {
      owner: "bg-black text-white",
      admin: "bg-blue-600 text-white",
      editor: "bg-amber-500 text-white",
      viewer: "bg-gray-200 text-gray-800",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[role]}`}>
        {role}
      </span>
    );
  };

  return (
    <>
      <Head>
        <title>Settings - Docuboard</title>
        <meta name="description" content="Manage your Docuboard account settings" />
      </Head>
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-bold text-black tracking-tight">Account Settings</h1>
              <p className="text-gray-600 mt-2 text-lg">
                Manage your profile and view your project roles
              </p>
            </div>
            <Button
              variant="outline"
              className="border-2"
              onClick={() => router.back()}
            >
              Back
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 border-2 border-red-600">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="text-xl">Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-sm text-gray-600">Loading settings...</p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-black">Email</label>
                      <Input
                        value={settings?.user.email || user?.email || ""}
                        disabled
                        className="mt-2 h-11 px-4 border-2 border-gray-200 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black">Username</label>
                      <Input
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="mt-2 h-11 px-4 border-2 border-gray-300 focus:border-black focus:ring-0"
                        placeholder="Enter a username"
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black">Full Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-2 h-11 px-4 border-2 border-gray-300 focus:border-black focus:ring-0"
                        placeholder="Enter your name"
                        disabled={isSaving}
                      />
                    </div>
                    <Button
                      className="bg-black hover:bg-gray-800 text-white"
                      disabled={!hasChanges || isSaving}
                      onClick={handleSave}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="text-xl">Project Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-sm text-gray-600">Loading projects...</p>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Total projects: <span className="font-semibold text-black">{projectCount}</span>
                    </div>
                    <div className="space-y-3">
                      {projects.length === 0 && (
                        <p className="text-sm text-gray-500">You are not in any projects yet.</p>
                      )}
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between gap-3 border-2 border-gray-200 px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: project.color || "#CBD5F5" }}
                            />
                            <div>
                              <div className="text-sm font-medium text-black">{project.name}</div>
                              <div className="text-xs text-gray-500">Role</div>
                            </div>
                          </div>
                          {renderRoleBadge(project.role)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
