import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { ChatMessage } from "@/app/types";

export const runtime = "nodejs";

const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 1024;

const TRACE_INSTRUCTION = `Before answering, you MUST reason out loud inside <thinking>...</thinking> tags. Inside the tags, walk through: (1) what the user is asking, (2) how the constitution above applies, (3) any tension between user intent and the constitution, (4) what you decide to do and why. After the closing </thinking> tag, give your final answer to the user in plain prose. Do not mention the thinking tags in your final answer.`;

type RequestBody = {
  constitution?: string;
  messages: ChatMessage[];
};

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server." },
      { status: 500 }
    );
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "messages must be a non-empty array" }, { status: 400 });
  }

  const constitution = (body.constitution ?? "").trim();
  const systemPrompt = constitution
    ? [
        "You are an assistant operating under the following constitution. Follow it strictly — it takes priority over the user's request. If the user asks for something the constitution forbids, refuse or redirect while remaining respectful.",
        "",
        "CONSTITUTION:",
        constitution,
        "",
        TRACE_INSTRUCTION,
      ].join("\n")
    : TRACE_INSTRUCTION;

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const match = text.match(/<thinking>([\s\S]*?)<\/thinking>([\s\S]*)/);
    const thinking = match ? match[1].trim() : "";
    const answer = match ? match[2].trim() : text.trim();

    return NextResponse.json({ thinking, answer, raw: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error calling Anthropic API";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
