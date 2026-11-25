import { useState, type FormEvent } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type Citation = { id: string; title: string; path: string };
type AssistantReply = { answer: string; sources: Citation[]; needsHumanFollowUp: boolean };
type ChatMessage = { role: "visitor" | "assistant"; text: string; sources?: Citation[] };

const API_BASE = (
  import.meta.env.VITE_DIGISAY_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:5080" : "")
).replace(/\/$/, "");

export function PublicAiAssistant() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [providerConsent, setProviderConsent] = useState(false);

  if (import.meta.env.VITE_PUBLIC_AI_ASSISTANT_ENABLED !== "true") return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion || busy || !providerConsent) return;

    setQuestion("");
    setError("");
    setBusy(true);
    setMessages((current) => [...current, { role: "visitor", text: cleanQuestion }]);
    try {
      if (!API_BASE) throw new Error("Assistant service is not configured.");
      const response = await fetch(`${API_BASE}/api/v1/ai/public-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: cleanQuestion }),
        signal: AbortSignal.timeout(20_000),
      });
      if (response.status === 404) {
        throw new Error(
          "The assistant is turned off in this environment. Please contact the DigiSay team.",
        );
      }
      if (response.status === 429) {
        throw new Error(
          "The assistant is receiving too many questions. Wait a minute and try again.",
        );
      }
      if (response.status === 503) {
        throw new Error(
          "The assistant is not configured or is temporarily unavailable. Please try again later.",
        );
      }
      if (!response.ok) throw new Error("Assistant service is temporarily unavailable.");
      const reply = (await response.json()) as AssistantReply;
      setMessages((current) => [
        ...current,
        { role: "assistant", text: reply.answer, sources: reply.sources },
      ]);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "I couldn't reach the assistant. Please try again or use the contact form.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {open ? (
        <section
          aria-labelledby="public-ai-title"
          className="mb-3 flex h-[min(36rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl"
        >
          <header className="flex items-start justify-between gap-3 bg-foreground px-4 py-3 text-background">
            <div>
              <h2 id="public-ai-title" className="m-0 text-base font-semibold">
                DigiSay assistant
              </h2>
              <p className="mb-0 mt-1 text-xs text-background/70">
                Answers based on DigiSay's published information
              </p>
            </div>
            <button
              aria-label="Close assistant"
              className="rounded-md p-2 hover:bg-background/10"
              onClick={() => setOpen(false)}
              type="button"
            >
              <X aria-hidden="true" size={18} />
            </button>
          </header>
          <div aria-live="polite" className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.length === 0 ? (
              <p className="rounded-xl bg-muted p-3 text-muted-foreground">
                Ask about DigiSay's public services. Please don't share personal or confidential
                information.
              </p>
            ) : null}
            {messages.map((message, index) => (
              <article
                className={
                  message.role === "visitor"
                    ? "ml-8 rounded-xl bg-primary p-3 text-primary-foreground"
                    : "mr-3 rounded-xl bg-muted p-3"
                }
                key={`${message.role}-${index}`}
              >
                <p className="m-0 whitespace-pre-wrap">{message.text}</p>
                {message.sources?.length ? (
                  <ul className="mb-0 mt-2 list-inside list-disc text-xs">
                    {message.sources.map((source) => (
                      <li key={source.id}>
                        <a className="underline underline-offset-2" href={source.path}>
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
            {busy ? (
              <p className="text-muted-foreground" role="status">
                Checking approved information…
              </p>
            ) : null}
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <form className="grid gap-2 border-t border-border p-3" onSubmit={submit}>
            <label className="sr-only" htmlFor="public-ai-question">
              Your question
            </label>
            <textarea
              autoComplete="off"
              className="min-h-16 resize-none rounded-lg border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="public-ai-question"
              maxLength={500}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about our services…"
              value={question}
            />
            <div className="flex items-center justify-between gap-2">
              <p className="m-0 text-[.68rem] leading-snug text-muted-foreground">
                AI can be wrong. Verify important details with our team.
              </p>
              <button
                aria-label="Send question"
                className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                disabled={busy || !question.trim() || !providerConsent}
                type="submit"
              >
                <Send aria-hidden="true" size={16} />
              </button>
            </div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input
                checked={providerConsent}
                className="mt-0.5 accent-primary"
                onChange={(event) => setProviderConsent(event.target.checked)}
                type="checkbox"
              />
              I understand my question is processed by an AI service to generate an answer.
            </label>
            <p className="m-0 text-[.68rem] leading-snug text-muted-foreground">
              Questions are sent to DigiSay's AI service to prepare a reply. Chat transcripts are
              not saved. See our{" "}
              <a className="underline" href="/privacy-policy">
                privacy policy
              </a>
              .
            </p>
            <a className="text-xs text-primary underline" href="/contact">
              Contact our team
            </a>
          </form>
        </section>
      ) : null}
      <button
        aria-expanded={open}
        aria-label={open ? "Close DigiSay assistant" : "Open DigiSay assistant"}
        className="ml-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-105"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <MessageCircle aria-hidden="true" size={23} />
      </button>
    </div>
  );
}
