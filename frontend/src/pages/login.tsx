import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth";

const demoUsers = [
  { username: "john_owner", password: "password123", name: "John Doe", role: "Owner" },
  { username: "jane_admin", password: "password123", name: "Jane Smith", role: "Admin" },
  { username: "bob_editor", password: "password123", name: "Bob Johnson", role: "Editor" },
  { username: "alice_viewer", password: "password123", name: "Alice Williams", role: "Viewer" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, signup } = useAuth();
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
      await login(username, password);
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
      await signup(
        signupData.username,
        signupData.password,
        signupData.name,
        signupData.role
      );
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
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-full max-w-md px-4">
            {/* Back to Landing Link */}
            <div className="text-center mb-4">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-gray-600 hover:text-black transition-colors font-medium"
            >
              ← Back to home
            </button>
          </div>
          <Card className="w-full border-2 border-black bg-white">
            <CardHeader className="space-y-2">
              <CardTitle className="text-center text-3xl font-bold text-black tracking-tight">
                Create Account
              </CardTitle>
              <p className="text-center text-sm text-gray-600">
                Sign up to start managing your documents
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="flex flex-col gap-4 mt-6">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border-2 border-red-600 rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">Username</label>
                  <Input
                    value={signupData.username}
                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                    placeholder="Choose a username"
                    className="h-11 px-4 border-2 border-gray-300 focus:border-black focus:ring-0"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">Full Name</label>
                  <Input
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="h-11 px-4 border-2 border-gray-300 focus:border-black focus:ring-0"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">Password</label>
                  <Input
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="Choose a password"
                    className="h-11 px-4 border-2 border-gray-300 focus:border-black focus:ring-0"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 h-11 bg-black hover:bg-gray-800 text-white font-medium"
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSignup(false);
                    setError("");
                  }}
                  className="text-sm text-black hover:text-gray-600 underline font-medium"
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-4">
        {/* Back to Landing Link */}
        <div className="text-center mb-4">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-gray-600 hover:text-black transition-colors font-medium"
          >
            ← Back to home
          </button>
        </div>
        <Card className="w-full border-2 border-black bg-white">
          <CardHeader className="space-y-2">
            <CardTitle className="text-center text-3xl font-bold text-black tracking-tight">
              Welcome to DocuBoard
            </CardTitle>
            <p className="text-center text-sm text-gray-600">
              Sign in to start managing your documents
            </p>
            <p className="text-center text-xs text-gray-500 mt-2">
              Demo: john_owner / password123
            </p>
          </CardHeader>
          <CardContent>
            {/* Demo User Selector */}
            <div className="mb-6">
              <label className="text-sm font-medium text-black mb-2 block">
                Quick Demo Login
              </label>
              <div className="grid grid-cols-2 gap-2">
                {demoUsers.map((user) => (
                  <button
                    key={user.username}
                    type="button"
                    onClick={() => selectDemoUser(user)}
                    className="p-2 text-left text-xs border-2 border-gray-200 hover:border-black hover:bg-gray-50 transition-all"
                  >
                    <div className="font-medium text-black">{user.name}</div>
                    <div className="text-gray-500">{user.role}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border-2 border-red-600">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="h-11 px-4 border-2 border-gray-300 focus:border-black focus:ring-0"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-11 px-4 border-2 border-gray-300 focus:border-black focus:ring-0"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 h-11 bg-black hover:bg-gray-800 text-white font-medium"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowSignup(true);
                  setError("");
                }}
                className="text-sm text-black hover:text-gray-600 underline font-medium"
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
