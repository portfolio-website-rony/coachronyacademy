import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page doesn't exist or has moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try refreshing the page.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow"
          >
            Try again
          </button>
          <a href="/" className="glass rounded-xl px-4 py-2 text-sm font-semibold">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CoachRony — AI দিয়ে স্কিল, ব্র্যান্ড ও ইনকাম তৈরি করুন" },
      { name: "description", content: "CoachRony — AI Content Creation, Vibe Coding, Digital Products ও Online Business শিখুন। Bangla AI creator coaching, programs ও services।" },
      { name: "author", content: "CoachRony" },
      { property: "og:title", content: "CoachRony — AI Creator & Digital Educator" },
      { property: "og:description", content: "AI দিয়ে নিজের স্কিল, ব্র্যান্ড ও ইনকাম তৈরি করুন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideChrome =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/client") ||
    pathname === "/dashboard";
  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative flex min-h-screen flex-col">
        {!hideChrome && <Header />}
        <main className="flex-1">
          <Outlet />
        </main>
        {!hideChrome && <Footer />}
        {!hideChrome && <FloatingActions />}
        <Toaster position="top-center" theme="dark" richColors />
      </div>
    </QueryClientProvider>
  );
}
