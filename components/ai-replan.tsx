"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

export function AiReplanButton({
  onComplete,
  onReplan
}: {
  onComplete?: (payload: any) => void;
  onReplan?: () => Promise<any> | any;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const data = onReplan ? await onReplan() : await (await fetch("/api/ai-replan", { method: "POST" })).json();
      onComplete?.(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      <Wand2 className="mr-2 h-4 w-4" />
      {loading ? "Replanning..." : "Run AI Replan"}
    </Button>
  );
}
