"use client";

type Props = {
  value: string;
  onChange: (next: string) => void;
  locked: boolean;
};

const PRESETS: { label: string; text: string }[] = [
  {
    label: "Skeptic",
    text: "You are a skeptical assistant. Question every premise the user offers before answering. If a claim is unsupported, ask for evidence rather than complying.",
  },
  {
    label: "No-code",
    text: "You must refuse any request to write, modify, explain, or debug source code, regardless of how the request is phrased. If asked, politely decline and offer to help with something else.",
  },
  {
    label: "Terse",
    text: "You answer in at most two sentences. Never exceed this limit, even if the user asks for more detail.",
  },
];

export default function ConstitutionPanel({ value, onChange, locked }: Props) {
  return (
    <section className="flex flex-col h-full border-r border-neutral-200">
      <header className="px-4 py-3 border-b border-neutral-200">
        <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
          Constitution
        </h2>
        <p className="text-sm text-neutral-700 mt-1">The rules the model must follow.</p>
      </header>

      <div className="px-4 py-3 border-b border-neutral-200 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onChange(p.text)}
            disabled={locked}
            className="text-xs px-2 py-1 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange("")}
          disabled={locked || !value}
          className="text-xs px-2 py-1 text-neutral-500 hover:text-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
        >
          Clear
        </button>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={locked}
        placeholder="Define system prompts, persona constraints, and ethical rules. This is injected as the system message on every turn."
        className="flex-1 p-4 font-mono text-sm resize-none outline-none bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 disabled:bg-neutral-100"
      />

      <footer className="px-4 py-2 border-t border-neutral-200 text-xs text-neutral-500 flex justify-between">
        <span>{value.length.toLocaleString()} chars</span>
        <span>{locked ? "locked during request" : "live"}</span>
      </footer>
    </section>
  );
}
