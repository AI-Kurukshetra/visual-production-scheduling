"use client";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        router.replace("/login");
      } else {
        setCheckingSession(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      } else {
        setCheckingSession(false);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f2ec] text-slate-700">
        Checking session...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen app-shell">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
      </div>
      <div className="relative flex min-h-screen">
        <Sidebar />
        <main className="flex-1 px-6 py-8 lg:px-10">
          <Topbar />
          <div className="mt-8 space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
