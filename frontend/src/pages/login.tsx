import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const demoUsers = [
  { username: "john_owner", password: "password123", name: "John Doe", role: "Owner" },
  { username: "jane_admin", password: "password123", name: "Jane Smith", role: "Admin" },
  { username: "bob_editor", password: "password123", name: "Bob Johnson", role: "Editor" },
  { username: "alice_viewer", password: "password123", name: "Alice Williams", role: "Viewer" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState({
    username: "",
    password: "",
    name: "",
    role: "viewer",
  });

  const selectDemoUser = (user: typeof demoUsers[0]) => {
    setUsername(user.username);
    setPassword(user.password);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const userData = await api.login(username, password);
      localStorage.setItem("user", JSON.stringify(userData));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.username || !signupData.password || !signupData.name) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const userData = await api.signup(
        signupData.username,
        signupData.password,
        signupData.name,
        signupData.role
      );
      localStorage.setItem("user", JSON.stringify(userData));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (showSignup) {
    return (
      <>
        <Head>
          <title>Sign Up - Docuboard</title>
          <meta name="description" content="Create your Docuboard account" />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-sky-100">
          <div className="w-full max-w-md px-4">
            {/* Back to Landing Link */}
            <div className="text-center mb-4">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-slate-600 hover:text-sky-600 transition-colors"
            >
              ← Back to home
            </button>
          </div>
          <Card className="w-full shadow-2xl border border-slate-200/50 backdrop-blur-sm bg-white/90">
            <CardHeader className="space-y-2">
              <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                Create Account
              </CardTitle>
              <p className="text-center text-sm text-slate-600">
                Sign up to start managing your documents
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="flex flex-col gap-4 mt-6">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Username</label>
                  <Input
                    value={signupData.username}
                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                    placeholder="Choose a username"
                    className="h-11 px-4 border-slate-200 focus:border-sky-500 focus:ring-sky-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <Input
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="h-11 px-4 border-slate-200 focus:border-sky-500 focus:ring-sky-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <Input
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="Choose a password"
                    className="h-11 px-4 border-slate-200 focus:border-sky-500 focus:ring-sky-500"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 h-11 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-medium"
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSignup(false);
                    setError("");
                  }}
                  className="text-sm text-sky-600 hover:text-sky-700 underline"
                >
                  Already have an account? Sign in
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Login - Docuboard</title>
        <meta name="description" content="Sign in to your Docuboard account" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-sky-100">
        <div className="w-full max-w-md px-4">
        {/* Back to Landing Link */}
        <div className="text-center mb-4">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-slate-600 hover:text-sky-600 transition-colors"
          >
            ← Back to home
          </button>
        </div>
        <Card className="w-full shadow-2xl border border-slate-200/50 backdrop-blur-sm bg-white/90">
          <CardHeader className="space-y-2">
            <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to DocuBoard
            </CardTitle>
            <p className="text-center text-sm text-slate-600">
              Sign in to start managing your documents
            </p>
            <p className="text-center text-xs text-slate-500 mt-2">
              Demo: john_owner / password123
            </p>
          </CardHeader>
          <CardContent>
            {/* Demo User Selector */}
            <div className="mb-6">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Quick Demo Login
              </label>
              <div className="grid grid-cols-2 gap-2">
                {demoUsers.map((user) => (
                  <button
                    key={user.username}
                    type="button"
                    onClick={() => selectDemoUser(user)}
                    className="p-2 text-left text-xs border border-slate-200 rounded-md hover:border-sky-400 hover:bg-sky-50 transition-all"
                  >
                    <div className="font-medium text-slate-800">{user.name}</div>
                    <div className="text-slate-500">{user.role}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="h-11 px-4 border-slate-200 focus:border-sky-500 focus:ring-sky-500"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-11 px-4 border-slate-200 focus:border-sky-500 focus:ring-sky-500"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 h-11 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-medium"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowSignup(true);
                  setError("");
                }}
                className="text-sm text-sky-600 hover:text-sky-700 underline"
              >
                Don't have an account? Sign up
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
