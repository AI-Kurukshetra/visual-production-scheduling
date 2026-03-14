"use client";
import { Bell, CircleUser, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssistantPanel } from "@/components/assistant-panel";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Topbar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("Planner");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email);
      }
    });
  }, []);

  const handleSignOut = async () => {
    if (!supabase) {
      router.replace("/login");
      return;
    }
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="section-title">Production Command</p>
        <h1 className="text-2xl font-semibold text-slate-900">Manufacturing Scheduling Overview</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
          <Search className="h-4 w-4" />
          Search work orders, lines, or resources
        </div>
        <AssistantPanel />
        <Button variant="secondary" size="sm">
          <Bell className="mr-2 h-4 w-4" />
          3 Alerts
        </Button>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <CircleUser className="h-4 w-4" />
          {userEmail}
        </div>
        <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
          <LogOut className="h-4 w-4 text-slate-500" />
        </Button>
      </div>
    </div>
  );
}
