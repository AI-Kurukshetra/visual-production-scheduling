import Link from "next/link";
import { LayoutDashboard, CalendarClock, ClipboardList, Users, AlertTriangle, GitCompare, Factory } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Plant Dashboard", icon: LayoutDashboard },
  { href: "/scheduler", label: "Visual Scheduler", icon: CalendarClock },
  { href: "/work-orders", label: "Work Orders", icon: ClipboardList },
  { href: "/resources", label: "Resources", icon: Users },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/scenarios", label: "Scenario Compare", icon: GitCompare }
];

export function Sidebar() {
  return (
    <aside className="h-full w-72 border-r border-slate-200/80 bg-white/80 p-6 shadow-[18px_0_40px_-40px_rgba(15,23,42,0.35)]">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-slate-900 flex items-center justify-center shadow-sm">
          <Factory className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">SmartSched AI</p>
          <p className="text-lg font-semibold text-slate-900">Apex Plant</p>
        </div>
      </div>
      <nav className="mt-6 flex flex-col gap-2">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <item.icon className="h-4 w-4 text-slate-500" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        <p className="uppercase tracking-widest text-slate-500 text-[10px]">Status</p>
        <p className="mt-2">3 lines active ? 1 maintenance conflict ? 2 critical WOs</p>
      </div>
    </aside>
  );
}
