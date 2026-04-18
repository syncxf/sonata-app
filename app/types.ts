export type Role = "user" | "assistant";

export type ChatMessage = {
  role: Role;
  content: string;
};

export type SideResult = {
  thinking: string;
  answer: string;
  raw: string;
};

export type SideState = {
  loading: boolean;
  error: string | null;
  result: SideResult | null;
};

export type EvaluationState =
  | { status: "idle" }
  | { status: "pending" }
  | {
      status: "done";
      score: number;
      justification: string;
      hardenedConstitution: string | null;
    }
  | { status: "error"; message: string };

export type Turn = {
  turn: number;
  userMessage: string;
  constitutionSnapshot: string;
  aligned: SideState;
  naked: SideState;
  evaluation: EvaluationState;
};

export type ChatApiResponse = {
  thinking: string;
  answer: string;
  raw: string;
};

export type EvalApiResponse = {
  score: number;
  justification: string;
  hardenedConstitution: string | null;
};

export type RedTeamApiResponse = {
  prompt: string;
};

export type ApiError = {
  error: string;
};
