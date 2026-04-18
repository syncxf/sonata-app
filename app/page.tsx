"use client";

import { useState } from "react";
import ConstitutionPanel from "./components/ConstitutionPanel";
import GauntletPanel from "./components/GauntletPanel";
import TracePanel from "./components/TracePanel";
import type {
  ApiError,
  ChatApiResponse,
  ChatMessage,
  EvalApiResponse,
  RedTeamApiResponse,
  Turn,
} from "./types";

export default function Home() {
  const [constitution, setConstitution] = useState("");
  const [alignedHistory, setAlignedHistory] = useState<ChatMessage[]>([]);
  const [nakedHistory, setNakedHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [selectedTurnIdx, setSelectedTurnIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redTeamLoading, setRedTeamLoading] = useState(false);
  const [redTeamError, setRedTeamError] = useState<string | null>(null);

  const patchTurn = (idx: number, patch: (t: Turn) => Turn) => {
    setTurns((all) => all.map((t, i) => (i === idx ? patch(t) : t)));
  };

  const submit = async () => {
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    setError(null);
    setLoading(true);
    setInput("");

    const constitutionSnapshot = constitution;
    const alignedMessages: ChatMessage[] = [
      ...alignedHistory,
      { role: "user", content: userMessage },
    ];
    const nakedMessages: ChatMessage[] = [
      ...nakedHistory,
      { role: "user", content: userMessage },
    ];

    setAlignedHistory(alignedMessages);
    setNakedHistory(nakedMessages);

    const turnIdx = turns.length;
    const newTurn: Turn = {
      turn: turnIdx + 1,
      userMessage,
      constitutionSnapshot,
      aligned: { loading: true, error: null, result: null },
      naked: { loading: true, error: null, result: null },
      evaluation: { status: "idle" },
    };
    setTurns((all) => [...all, newTurn]);
    setSelectedTurnIdx(turnIdx);

    const alignedPromise = callChat(constitutionSnapshot, alignedMessages);
    const nakedPromise = callChat("", nakedMessages);

    alignedPromise
      .then((result) => {
        patchTurn(turnIdx, (t) => ({
          ...t,
          aligned: { loading: false, error: null, result },
        }));
        setAlignedHistory((h) => [
          ...h,
          { role: "assistant", content: result.answer },
        ]);
        evaluateTurn(turnIdx, userMessage, constitutionSnapshot, result.answer);
      })
      .catch((err: Error) => {
        patchTurn(turnIdx, (t) => ({
          ...t,
          aligned: { loading: false, error: err.message, result: null },
        }));
      });

    nakedPromise
      .then((result) => {
        patchTurn(turnIdx, (t) => ({
          ...t,
          naked: { loading: false, error: null, result },
        }));
        setNakedHistory((h) => [
          ...h,
          { role: "assistant", content: result.answer },
        ]);
      })
      .catch((err: Error) => {
        patchTurn(turnIdx, (t) => ({
          ...t,
          naked: { loading: false, error: err.message, result: null },
        }));
      });

    await Promise.allSettled([alignedPromise, nakedPromise]);
    setLoading(false);
  };

  const evaluateTurn = async (
    turnIdx: number,
    userPrompt: string,
    constitutionUsed: string,
    alignedModelResponse: string,
  ) => {
    patchTurn(turnIdx, (t) => ({ ...t, evaluation: { status: "pending" } }));
    try {
      const res = await fetch("/api/eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt,
          constitution: constitutionUsed,
          alignedModelResponse,
        }),
      });
      const json = (await res.json()) as EvalApiResponse | ApiError;
      if (!res.ok || "error" in json) {
        const msg = "error" in json ? json.error : `HTTP ${res.status}`;
        throw new Error(msg);
      }
      patchTurn(turnIdx, (t) => ({
        ...t,
        evaluation: {
          status: "done",
          score: json.score,
          justification: json.justification,
          hardenedConstitution: json.hardenedConstitution,
        },
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Eval failed";
      patchTurn(turnIdx, (t) => ({
        ...t,
        evaluation: { status: "error", message },
      }));
    }
  };

  const reset = () => {
    setAlignedHistory([]);
    setNakedHistory([]);
    setTurns([]);
    setSelectedTurnIdx(null);
    setError(null);
    setRedTeamError(null);
    setInput("");
  };

  const runRedTeam = async () => {
    if (redTeamLoading || loading) return;
    setRedTeamError(null);
    setRedTeamLoading(true);
    try {
      const res = await fetch("/api/redteam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ constitution }),
      });
      const json = (await res.json()) as RedTeamApiResponse | ApiError;
      if (!res.ok || "error" in json) {
        const msg = "error" in json ? json.error : `HTTP ${res.status}`;
        throw new Error(msg);
      }
      setInput(json.prompt);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Red-team failed";
      setRedTeamError(message);
    } finally {
      setRedTeamLoading(false);
    }
  };

  const applyHardened = (hardened: string) => {
    setConstitution(hardened);
  };

  return (
    <div className="flex flex-col h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200 px-6 py-3 flex items-baseline justify-between">
        <div>
          <h1 className="text-base font-semibold tracking-tight">Sonata</h1>
          <p className="text-xs text-neutral-500">
            Constitutional Sandbox · aligned vs naked · haiku-4-5 + sonnet-4-6 evaluator
          </p>
        </div>
        <p className="text-xs text-neutral-400 font-mono">
          {turns.length} turn{turns.length === 1 ? "" : "s"}
        </p>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_minmax(0,2fr)] min-h-0">
        <ConstitutionPanel
          value={constitution}
          onChange={setConstitution}
          locked={loading}
        />
        <GauntletPanel
          messages={alignedHistory}
          input={input}
          onInputChange={setInput}
          onSubmit={submit}
          loading={loading}
          error={error}
          onReset={reset}
          onRedTeam={runRedTeam}
          redTeamLoading={redTeamLoading}
          redTeamError={redTeamError}
        />
        <TracePanel
          turns={turns}
          selectedIdx={selectedTurnIdx}
          onSelect={setSelectedTurnIdx}
          onApplyHardened={applyHardened}
        />
      </main>
    </div>
  );
}

async function callChat(
  constitution: string,
  messages: ChatMessage[],
): Promise<ChatApiResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ constitution, messages }),
  });
  const json = (await res.json()) as ChatApiResponse | ApiError;
  if (!res.ok || "error" in json) {
    const msg = "error" in json ? json.error : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json;
}
