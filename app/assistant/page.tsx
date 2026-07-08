import { AssistantChat } from "@/components/AssistantChat";

export const dynamic = "force-dynamic";

export default function AssistantPage() {
  return (
    <div className="space-y-6 pb-16">
      <section>
        <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">Ассистент</div>
        <h1 className="section-title mt-2">Чат-ассистент по базе раскидов</h1>
        <p className="section-copy mt-3 max-w-3xl">
          Ассистент не выдумывает данные. Он ищет только по опубликованным раскидам, группирует результаты по типам гранат и честно сообщает, если нужной записи пока нет.
        </p>
      </section>
      <AssistantChat />
    </div>
  );
}
