"use client";

import { FormEvent, useRef, useEffect } from "react";
import type { ChatMessage } from "@/app/types";

type Props = {
  messages: ChatMessage[];
  input: string;
  onInputChange: (next: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  onReset: () => void;
  onRedTeam: () => void;
  redTeamLoading: boolean;
  redTeamError: string | null;
};

export default function GauntletPanel({
  messages,
  input,
  onInputChange,
  onSubmit,
  loading,
  error,
  onReset,
  onRedTeam,
  redTeamLoading,
  redTeamError,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, loading]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSubmit();
  };

  return (
    <section className="flex flex-col h-full bg-white border-r border-neutral-200">
      <header className="px-4 py-3 border-b border-neutral-200 flex items-start justify-between">
        <div>
          <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
            Adversarial Gauntlet
          </h2>
          <p className="text-sm text-neutral-700 mt-1">
            Test prompt injections, jailbreaks, edge cases.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={onReset}
            disabled={loading}
            className="text-xs text-neutral-500 hover:text-neutral-900 disabled:opacity-40"
          >
            reset
          </button>
        )}
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !loading && (
          <p className="text-sm text-neutral-400 italic">
            No turns yet. Write a message below — try something the constitution forbids.
          </p>
        )}

        {messages.map((m, i) => (
          <div key={i} className="text-sm">
            <div className="text-xs uppercase tracking-wider text-neutral-400 mb-1">
              {m.role}
            </div>
            <div className="whitespace-pre-wrap text-neutral-900 leading-relaxed">
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-sm">
            <div className="text-xs uppercase tracking-wider text-neutral-400 mb-1">
              assistant
            </div>
            <div className="text-neutral-400 italic">thinking…</div>
          </div>
        )}

        {error && (
          <div className="text-sm border border-red-300 bg-red-50 text-red-800 p-3">
            <div className="text-xs uppercase tracking-wider text-red-600 mb-1">error</div>
            {error}
          </div>
        )}

        {redTeamError && (
          <div className="text-sm border border-red-300 bg-red-50 text-red-800 p-3">
            <div className="text-xs uppercase tracking-wider text-red-600 mb-1">
              red-teamer error
            </div>
            {redTeamError}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-neutral-200 p-3 flex gap-2">
        <button
          type="button"
          onClick={onRedTeam}
          disabled={loading || redTeamLoading}
          title="Auto-generate an adversarial prompt targeting the current constitution"
          className="px-3 py-2 text-sm border border-neutral-300 text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
        >
          <TargetIcon spinning={redTeamLoading} />
          <span className="hidden sm:inline">
            {redTeamLoading ? "crafting…" : "Auto Red-Team"}
          </span>
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          disabled={loading}
          placeholder="Ask anything, or try to break the constitution…"
          className="flex-1 border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 disabled:bg-neutral-100"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </section>
  );
}

function TargetIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={spinning ? "animate-spin" : ""}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="3" />
      <circle cx="8" cy="8" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}
