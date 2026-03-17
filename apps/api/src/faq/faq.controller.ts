import { Body, Controller, Get, Inject, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { FaqService } from "./faq.service";
import { AskDto } from "./dto/ask.dto";

@Controller()
export class FaqController {
  constructor(@Inject(FaqService) private readonly faqService: FaqService) {
    console.log("FaqController constructor faqService =", faqService);
  }

  @Post("ask")
  async ask(@Body() dto: AskDto, @Res() res: Response) {
    console.log(dto);
    const result = await this.faqService.ask(dto);

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    (res as any).flushHeaders?.();

    res.write(
      `data: ${JSON.stringify({
        event: "meta",
        sessionId: result.sessionId,
        question: result.question,
        category: result.category,
        route: result.route,
      })}\n\n`,
    );

    const answer = result.answer ?? "";
    const chunks = this.faqService.chunkAnswer(answer);
    for (const chunk of chunks) {
      res.write(
        `data: ${JSON.stringify({ event: "chunk", text: chunk })}\n\n`,
      );
    }

    res.write(`data: ${JSON.stringify({ event: "done" })}\n\n`);
    res.end();
  }

  @Get("health")
  health() {
    return this.faqService.health();
  }
}

