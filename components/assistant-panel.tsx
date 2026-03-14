"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const suggestedQuestions = [
  "Why is WO-1041 delayed?",
  "Which line has the highest utilization?",
  "What changed after AI replan?",
  "Which alerts are most critical today?"
];

export function AssistantPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "assistant-welcome",
      role: "assistant",
      content: "Ask about work orders, utilization, alerts, or scenario impacts."
    }
  ]);
  const [loading, setLoading] = useState(false);

  const lastAnswer = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === "assistant") return messages[i];
    }
    return messages[messages.length - 1];
  }, [messages]);

  async function handleAsk(question: string) {
    if (!question.trim()) return;
    const userMessage: AssistantMessage = { id: `user-${Date.now()}`, role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      const payload = await res.json();
      const answer = typeof payload?.answer === "string" ? payload.answer : "No response generated.";
      setMessages((prev) => [...prev, { id: `assistant-${Date.now()}`, role: "assistant", content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: "assistant", content: "Unable to reach the assistant endpoint." }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <MessageSquare className="mr-2 h-4 w-4" />
        AI Assistant
      </Button>

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-md translate-x-full border-l border-slate-200 bg-white/90 shadow-2xl transition-transform",
          open && "translate-x-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="section-title">AI Assistant</p>
            <p className="text-lg font-semibold text-slate-900">SmartSched Insights</p>
          </div>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Suggested Questions</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleAsk(question)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:border-slate-300"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <Card className="space-y-3 bg-white/80">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Latest Answer</p>
              <Badge className="border-slate-200 bg-slate-50 text-slate-600">Mock AI</Badge>
            </div>
            <p className="text-sm text-slate-700">{loading ? "Thinking through the latest signals..." : lastAnswer?.content}</p>
          </Card>

          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm",
                  message.role === "user" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                )}
              >
                {message.content}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto border-t border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about delays, utilization, or alerts"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAsk(input);
                }
              }}
            />
            <Button onClick={() => handleAsk(input)} disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
