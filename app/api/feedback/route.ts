import { NextResponse } from "next/server";
import { z } from "zod";

const feedbackSchema = z.object({
  type: z.string().trim().min(1).max(80),
  message: z.string().trim().min(5).max(2000),
  contact: z.string().trim().max(160).optional().default(""),
  currentUrl: z.string().trim().min(1).max(500),
  lineupSlug: z.string().trim().max(180).optional().default(""),
  mapSlug: z.string().trim().max(80).optional().default(""),
  userAgent: z.string().trim().max(500).optional().default(""),
  website: z.string().trim().max(200).optional().default("")
});

function formatFeedbackMessage(data: z.infer<typeof feedbackSchema>) {
  return [
    "🧩 Feedback CyberLineup",
    "",
    `Тип: ${data.type}`,
    `Страница: ${data.currentUrl}`,
    `Lineup: ${data.lineupSlug || "-"}`,
    `Map: ${data.mapSlug || "-"}`,
    `Контакт: ${data.contact || "-"}`,
    "",
    "Сообщение:",
    data.message,
    "",
    "UserAgent:",
    data.userAgent || "-"
  ].join("\n");
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = feedbackSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте сообщение: минимум 5 символов, максимум 2000." }, { status: 400 });
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_FEEDBACK_CHAT_ID;
  const topicId = process.env.TELEGRAM_FEEDBACK_TOPIC_ID;

  if (!token || !chatId) {
    return NextResponse.json({ error: "Feedback временно не настроен. Добавьте Telegram env на сервере." }, { status: 503 });
  }

  const payload: Record<string, string | number | boolean> = {
    chat_id: chatId,
    text: formatFeedbackMessage(parsed.data),
    disable_web_page_preview: true
  };

  if (topicId && Number.isFinite(Number(topicId))) {
    payload.message_thread_id = Number(topicId);
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Telegram не принял сообщение. Попробуйте позже." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
