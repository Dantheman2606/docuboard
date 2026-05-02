import "@/styles/globals.css";
import "tippy.js/dist/tippy.css";
import type { AppProps } from "next/app";
import { Providers } from "@/lib/providers";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import { checkLocalStorageStatus } from "@/stores/documentStore";
import { NotificationProvider } from "@/features/activity";
import { useAuthStore } from "@/features/auth/store/authStore";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Zustand persist rehydrates synchronously, but we need one tick for SSR
  useEffect(() => {
    const { isAuthenticated } = useAuthStore.getState();
    const publicRoutes = ["/", "/login"];
    const isPublicRoute = publicRoutes.includes(router.pathname);

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/login");
    }

    setIsLoading(false);

    if (typeof window !== "undefined") {
      (window as any).checkDocumentStorage = checkLocalStorageStatus;
    }
  }, [router]);

  if (isLoading) return null;

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

  return (
    <Providers>
      <NotificationProvider>
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </NotificationProvider>
    </Providers>
  );
}
