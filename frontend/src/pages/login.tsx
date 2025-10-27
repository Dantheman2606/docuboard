import { useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;
    // Mock auth store persistence
    localStorage.setItem("user", JSON.stringify({ name, role }));
    router.push("/projects");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-sky-100">
      <div className="w-full max-w-md px-4">
        <Card className="w-full shadow-2xl border border-slate-200/50 backdrop-blur-sm bg-white/90">
          <CardHeader className="space-y-2">
            <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to DocuBoard
            </CardTitle>
            <p className="text-center text-sm text-slate-600">
              Sign in to start managing your documents
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-11 px-4 border-slate-200 focus:border-sky-500 focus:ring-sky-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Role
                </label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-11 border-slate-200 focus:border-sky-500 focus:ring-sky-500 transition-colors">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="owner" className="hover:bg-sky-50">
                      Owner
                    </SelectItem>
                    <SelectItem value="admin" className="hover:bg-sky-50">
                      Admin
                    </SelectItem>
                    <SelectItem value="editor" className="hover:bg-sky-50">
                      Editor
                    </SelectItem>
                    <SelectItem value="viewer" className="hover:bg-sky-50">
                      Viewer
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="mt-4 h-11 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-medium text-base transition-all duration-200 shadow-lg shadow-sky-200"
              >
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
