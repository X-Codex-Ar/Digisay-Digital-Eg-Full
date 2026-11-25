import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { apiUrl } from '../../core/api-url';

interface AssistantAnswer {
  answer: string;
  sources: { id: string; title: string; path: string }[];
  needsHumanFollowUp: boolean;
}

interface ChatMessage {
  question: string;
  response?: AssistantAnswer;
  error?: string;
}

@Component({
  selector: 'ds-ai-assistant',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="mx-auto grid w-full max-w-4xl gap-6" aria-labelledby="assistant-title">
      <header>
        <span class="text-[.7rem] font-bold uppercase tracking-[.14em] text-muted-foreground">DigiSay AI</span>
        <h1 id="assistant-title" class="mb-2 mt-2 text-3xl font-bold tracking-tight">Knowledge assistant</h1>
        <p class="m-0 text-sm text-muted-foreground">Ask about DigiSay's public services. Answers use approved public FAQ content and include their source pages.</p>
      </header>

      <div class="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm" role="note">
        This assistant only searches public DigiSay information. It cannot access organization data, CRM records, or private files. Do not enter personal or confidential information.
      </div>

      <div class="grid min-h-72 content-start gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6" aria-live="polite" aria-relevant="additions">
        @if (messages().length === 0) {
          <p class="m-0 self-center text-center text-sm text-muted-foreground">Ask a question about services, digital rights, content production, or contacting DigiSay.</p>
        }
        @for (message of messages(); track $index) {
          <article class="ml-auto max-w-[90%] rounded-2xl bg-primary/10 p-4 text-sm">
            <p class="m-0 whitespace-pre-line">{{ message.question }}</p>
            @if (message.response) {
              <p class="mb-0 mt-3 whitespace-pre-line text-foreground">{{ message.response.answer }}</p>
              @if (message.response.sources.length > 0) {
                <div class="mt-3 border-t border-border/70 pt-2 text-xs">
                  <strong>Sources</strong>
                  <ul class="mb-0 mt-1 grid gap-1 pl-5">
                    @for (source of message.response.sources; track source.id) {
                      <li><a class="font-semibold text-primary underline underline-offset-2" [href]="publicPage(source.path)" target="_blank" rel="noopener noreferrer">{{ source.title }}</a></li>
                    }
                  </ul>
                </div>
              }
              @if (message.response.needsHumanFollowUp) {
                <p class="mb-0 mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300">For a definitive answer, contact the DigiSay team.</p>
              }
            }
            @if (message.error) {
              <p class="mb-0 mt-3 text-sm text-destructive" role="alert">{{ message.error }}</p>
            }
          </article>
        }
        @if (busy()) {
          <p class="m-0 text-sm text-muted-foreground" role="status">Checking approved DigiSay information…</p>
        }
      </div>

      <form class="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto]" (ngSubmit)="ask()">
        <label class="grid gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Your question
          <textarea class="min-h-20 resize-y rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-foreground" name="question" [(ngModel)]="question" maxlength="500" required placeholder="What digital rights services does DigiSay offer?"></textarea>
        </label>
        <button class="self-end rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50" type="submit" [disabled]="busy() || !question.trim()">{{ busy() ? 'Sending…' : 'Ask assistant' }}</button>
      </form>
    </section>
  `,
})
export class AiAssistantComponent {
  private readonly http = inject(HttpClient);
  question = '';
  readonly messages = signal<ChatMessage[]>([]);
  readonly busy = signal(false);

  ask(): void {
    const question = this.question.trim();
    if (!question || this.busy()) return;
    this.question = '';
    this.messages.update((messages) => [...messages, { question }]);
    const index = this.messages().length - 1;
    this.busy.set(true);
    this.http.post<AssistantAnswer>(apiUrl('ai/public-chat'), { question }).subscribe({
      next: (response) => {
        this.messages.update((messages) => messages.map((message, i) => i === index ? { ...message, response } : message));
        this.busy.set(false);
      },
      error: (error: unknown) => {
        this.messages.update((messages) => messages.map((message, i) => i === index ? { ...message, error: this.errorMessage(error) } : message));
        this.busy.set(false);
      },
    });
  }

  publicPage(path: string): string {
    const baseUrl = window.digisayRuntimeConfig?.publicBaseUrl ?? 'http://localhost:8080';
    return new URL(path, baseUrl).toString();
  }

  private errorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) return 'The assistant could not complete this request. Please try again.';
    if (error.status === 0) return 'Could not reach the DigiSay API. Check your connection and retry.';
    if (error.status === 400) return error.error?.errors?.Question?.[0] ?? 'Please remove personal details and ask a shorter question.';
    if (error.status === 404) return 'The assistant is turned off in this environment. An operator must enable AI:PublicAssistant and configure the server-side AI provider before it can answer.';
    if (error.status === 429) return 'Too many questions in a short time. Wait a minute and try again.';
    if (error.status === 503) return 'The assistant is not configured or is temporarily unavailable. Check the server-side AI provider settings, then try again.';
    return 'The assistant could not complete this request. Please try again later.';
  }
}
