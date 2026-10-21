import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { AppMark } from "@/components/AppMark";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent View",
  description: "See exactly what AI agents learn about you. An independent open-source project.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-night-800 focus:px-3 focus:py-2">
          Skip to content
        </a>
        <header className="sticky top-0 z-40 border-b border-white/10 bg-night-950/80 backdrop-blur">
          <nav className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4" aria-label="Primary">
            <a href="/story" className="flex items-center gap-2 font-semibold tracking-tight">
              <AppMark className="h-5 w-5 text-accent-soft" />
              Agent View
            </a>
            <div className="ml-auto flex items-center gap-1 text-sm">
              <a href="/agent-view" className="rounded-md px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white">Agent View</a>
              <a href="/story" className="rounded-md px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white">Story</a>
            </div>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer className="border-t border-white/10 px-4 py-6 text-center text-xs text-white/40">
          Independent project built with Claude Code. Seed data only.
        </footer>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
