"use client";

import type { EvaluationState, SideState, Turn } from "@/app/types";

type Props = {
  turns: Turn[];
  selectedIdx: number | null;
  onSelect: (idx: number) => void;
  onApplyHardened: (hardened: string) => void;
};

export default function TracePanel({
  turns,
  selectedIdx,
  onSelect,
  onApplyHardened,
}: Props) {
  const active = selectedIdx != null ? turns[selectedIdx] : null;

  return (
    <section className="flex flex-col h-full bg-neutral-50 min-w-0">
      <header className="px-4 py-3 border-b border-neutral-200">
        <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
          Trace · A/B Comparison
        </h2>
        <p className="text-sm text-neutral-700 mt-1">
          Side-by-side: aligned (under constitution) vs naked (no constraints).
        </p>
      </header>

      {turns.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <p className="text-sm text-neutral-400 italic">
            Run a turn in the Gauntlet to compare how the constitution steers the model.
          </p>
        </div>
      ) : (
        <>
          <TurnPicker turns={turns} selectedIdx={selectedIdx} onSelect={onSelect} />
          {active && (
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-200 overflow-hidden">
              <SideColumn
                label="Aligned Model · Haiku"
                accent="indigo"
                side={active.aligned}
                userMessage={active.userMessage}
                evaluation={active.evaluation}
                onApplyHardened={onApplyHardened}
              />
              <SideColumn
                label="Naked Model · Haiku"
                accent="neutral"
                side={active.naked}
                userMessage={active.userMessage}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}

function TurnPicker({
  turns,
  selectedIdx,
  onSelect,
}: {
  turns: Turn[];
  selectedIdx: number | null;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="px-4 py-2 border-b border-neutral-200 flex flex-wrap gap-1 overflow-x-auto bg-white">
      {turns.map((t, i) => {
        const score =
          t.evaluation.status === "done" ? t.evaluation.score : null;
        const selected = i === selectedIdx;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className={
              "text-xs px-2 py-1 border inline-flex items-center gap-1.5 " +
              (selected
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 text-neutral-700 hover:bg-neutral-100")
            }
          >
            <span>turn {t.turn}</span>
            {score != null && (
              <span
                className={
                  "text-[10px] px-1 py-px font-mono " +
                  (selected
                    ? "bg-white text-neutral-900"
                    : scoreBadgeClass(score))
                }
              >
                {score}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SideColumn({
  label,
  accent,
  side,
  userMessage,
  evaluation,
  onApplyHardened,
}: {
  label: string;
  accent: "indigo" | "neutral";
  side: SideState;
  userMessage: string;
  evaluation?: EvaluationState;
  onApplyHardened?: (hardened: string) => void;
}) {
  const accentBar =
    accent === "indigo" ? "bg-indigo-600" : "bg-neutral-400";

  return (
    <div className="flex flex-col min-h-0 min-w-0 bg-neutral-50">
      <div className="px-4 py-2 border-b border-neutral-200 bg-white flex items-center gap-2">
        <span className={`inline-block w-1.5 h-4 ${accentBar}`} />
        <span className="text-xs uppercase tracking-widest text-neutral-700 font-medium">
          {label}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {evaluation && (
          <EvalBadge state={evaluation} onApplyHardened={onApplyHardened} />
        )}

        <div>
          <div className="text-xs uppercase tracking-wider text-neutral-400 mb-1">
            User said
          </div>
          <div className="text-sm text-neutral-900 whitespace-pre-wrap">
            {userMessage}
          </div>
        </div>

        {side.loading && (
          <div className="text-xs text-neutral-400 italic">thinking…</div>
        )}

        {side.error && (
          <div className="text-xs text-red-800 bg-red-50 border border-red-200 p-3">
            <div className="uppercase tracking-wider text-red-600 mb-1">error</div>
            {side.error}
          </div>
        )}

        {side.result && (
          <>
            <div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 mb-1">
                Reasoning
              </div>
              {side.result.thinking ? (
                <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-neutral-800 bg-white border border-neutral-200 p-3">
                  {side.result.thinking}
                </pre>
              ) : (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3">
                  No &lt;thinking&gt; block emitted. The model ignored the trace instruction — itself a data point.
                </p>
              )}
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 mb-1">
                Final answer
              </div>
              <div className="text-sm text-neutral-900 whitespace-pre-wrap">
                {side.result.answer}
              </div>
            </div>

            <details className="text-xs text-neutral-500">
              <summary className="cursor-pointer hover:text-neutral-800">
                raw response
              </summary>
              <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] text-neutral-600 bg-white border border-neutral-200 p-3">
                {side.result.raw}
              </pre>
            </details>
          </>
        )}
      </div>
    </div>
  );
}

function EvalBadge({
  state,
  onApplyHardened,
}: {
  state: EvaluationState;
  onApplyHardened?: (hardened: string) => void;
}) {
  if (state.status === "idle") return null;

  if (state.status === "pending") {
    return (
      <div className="flex items-center gap-2 border border-indigo-300 bg-indigo-50 px-3 py-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
        </span>
        <span className="text-xs uppercase tracking-widest text-indigo-800 font-medium">
          Sonnet evaluator grading…
        </span>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="border border-red-200 bg-red-50 px-3 py-2">
        <div className="text-xs uppercase tracking-wider text-red-600 mb-1">
          eval failed
        </div>
        <div className="text-xs text-red-800">{state.message}</div>
      </div>
    );
  }

  const { score, justification, hardenedConstitution } = state;
  return (
    <div className="space-y-2">
      <div
        className={
          "border px-3 py-2 flex items-center gap-3 " + scoreBlockClass(score)
        }
      >
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold tabular-nums">{score}</span>
          <span className="text-[10px] uppercase tracking-widest opacity-70">
            /100
          </span>
        </div>
        <div className="text-xs leading-snug flex-1">
          <div className="uppercase tracking-widest text-[10px] opacity-70 mb-0.5">
            Safety score · Sonnet
          </div>
          {justification}
        </div>
      </div>

      {hardenedConstitution && (
        <HardenedRecommendation
          hardened={hardenedConstitution}
          onApply={onApplyHardened}
        />
      )}
    </div>
  );
}

function HardenedRecommendation({
  hardened,
  onApply,
}: {
  hardened: string;
  onApply?: (hardened: string) => void;
}) {
  return (
    <div className="border border-indigo-300 bg-indigo-50 text-indigo-900">
      <div className="px-3 py-2 border-b border-indigo-200 flex items-center justify-between gap-3">
        <div>
          <div className="uppercase tracking-widest text-[10px] text-indigo-700 font-medium">
            Security recommendation · Sonnet
          </div>
          <div className="text-xs text-indigo-800 mt-0.5">
            The constitution failed this turn. Sonnet proposes a hardened rewrite:
          </div>
        </div>
        {onApply && (
          <button
            type="button"
            onClick={() => onApply(hardened)}
            className="shrink-0 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5"
          >
            1-Click Apply
          </button>
        )}
      </div>
      <pre className="px-3 py-2 text-xs whitespace-pre-wrap font-mono leading-relaxed text-indigo-950 max-h-64 overflow-y-auto">
        {hardened}
      </pre>
    </div>
  );
}

function scoreBadgeClass(score: number): string {
  if (score >= 80) return "bg-emerald-100 text-emerald-900";
  if (score >= 50) return "bg-amber-100 text-amber-900";
  return "bg-rose-100 text-rose-900";
}

function scoreBlockClass(score: number): string {
  if (score >= 80) return "border-emerald-300 bg-emerald-50 text-emerald-900";
  if (score >= 50) return "border-amber-300 bg-amber-50 text-amber-900";
  return "border-rose-300 bg-rose-50 text-rose-900";
}
