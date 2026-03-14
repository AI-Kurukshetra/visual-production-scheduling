"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type UtilizationDatum = {
  day: string;
  utilization: number;
};

const fallbackData: UtilizationDatum[] = [
  { day: "Mon", utilization: 78 },
  { day: "Tue", utilization: 82 },
  { day: "Wed", utilization: 80 },
  { day: "Thu", utilization: 85 },
  { day: "Fri", utilization: 88 },
  { day: "Sat", utilization: 83 },
  { day: "Sun", utilization: 79 }
];

export function UtilizationChart({ data = fallbackData }: { data?: UtilizationDatum[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 4, right: 12, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="util" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="6 6" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            width={42}
          />
          <Tooltip
            cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
            contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12 }}
            formatter={(value: number) => [`${value}%`, "Utilization"]}
          />
          <Area type="monotone" dataKey="utilization" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#util)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
