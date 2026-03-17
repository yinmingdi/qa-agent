import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { AskDto } from "./dto/ask.dto";
import type { ConversationTurn } from "./state/faq.types";
import { createFaqGraph } from "./graph/faq.graph";

const { run } = createFaqGraph();

@Injectable()
export class FaqService {
  private readonly sessions = new Map<string, ConversationTurn[]>();

  private getOrCreateSession(sessionId?: string): { id: string; history: ConversationTurn[] } {
    let id = sessionId;
    if (!id || !this.sessions.has(id)) {
      id = id ?? randomUUID();
      this.sessions.set(id, []);
    }
    const history = this.sessions.get(id)!;
    return { id, history };
  }

  async ask(dto: AskDto) {
    const { id, history } = this.getOrCreateSession(dto.sessionId);

    history.push({ role: "user", text: dto.message });
    const result = await run(dto.message, history);

    if (result.answer) {
      history.push({ role: "assistant", text: result.answer });
    }

    this.sessions.set(id, history);

    return {
      sessionId: id,
      question: result.question,
      category: result.category,
      route: result.route,
      answer: result.answer,
    };
  }

  chunkAnswer(text: string, size = 30): string[] {
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
      chunks.push(text.slice(i, i + size));
      i += size;
    }
    return chunks.length ? chunks : [text];
  }

  health() {
    return { status: "ok" };
  }
}

