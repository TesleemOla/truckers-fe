import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "Truckers Dashboard",
  description: "Manage trucks, manifests, and drivers with real-time visibility.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
            <div className="absolute -left-24 top-10 h-56 w-56 rounded-full bg-primary-700/40 blur-3xl" />
            <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-emerald-600/30 blur-3xl" />
          </div>
          <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 shadow-soft ring-1 ring-slate-800">
                <span className="text-lg font-semibold tracking-tight text-primary-300">
                  T
                </span>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-slate-50">
                  Truckers
                </h1>
                <p className="text-xs text-slate-400">
                  Fleet &amp; route visibility at a glance
                </p>
              </div>
            </div>
          </header>
          <main className="flex-1">
            <AuthProvider>{children}</AuthProvider>
          </main>
        </div>
      </body>
    </html>
  );
}


