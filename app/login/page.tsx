"use client";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("planner@smartsched.ai");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setLoading(false);
      setError("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen app-shell flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="glass w-full max-w-lg rounded-3xl p-10 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)] space-y-4">
        <div className="mb-8">
          <p className="section-title">SmartSched AI</p>
          <h1 className="text-3xl font-semibold text-slate-900 mt-3">Sign in to your plant command center</h1>
          <p className="text-slate-600 mt-3">
            High-mix scheduling, AI-assisted replanning, and KPI clarity in one fast workspace.
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="planner@smartsched.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Password</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="????????"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button className="w-full" size="lg" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Enter SmartSched"}
          </Button>
          <p className="text-xs text-slate-500">Demo credentials are prefilled. Password: demo1234.</p>
        </div>
      </form>
    </div>
  );
}
