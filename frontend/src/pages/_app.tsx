import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Providers } from "@/lib/providers";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";



export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const publicRoutes = ["/", "/login"];
    const isPublicRoute = publicRoutes.includes(router.pathname);
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (!isPublicRoute) {
      router.replace("/login");
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) return null;

  // Public routes don't need authentication
  const publicRoutes = ["/", "/login"];
  const isPublicRoute = publicRoutes.includes(router.pathname);
  
  if (isPublicRoute) {
    return (
      <Providers>
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </Providers>
    );
  }
  return(
    <Providers>
      <Component {...pageProps} />
    </Providers>
  )
}
