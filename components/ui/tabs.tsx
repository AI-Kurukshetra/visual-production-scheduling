"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function Tabs({ tabs, value, onChange }: TabsProps) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white/80 p-1 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={cn(
            "px-4 py-2 text-xs font-medium rounded-lg transition",
            value === tab.value ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
          )}
          onClick={() => onChange(tab.value)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
