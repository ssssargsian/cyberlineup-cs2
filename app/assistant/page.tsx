import { AssistantChat } from "@/components/AssistantChat";

export const dynamic = "force-dynamic";

export default function AssistantPage() {
  return (
    <div className="space-y-6 pb-16">
      <section className="tactical-panel p-6 sm:p-8">
        <div className="relative">
          <div className="tactical-label text-orange-200">Ассистент</div>
          <h1 className="mt-2 text-4xl font-black leading-tight text-white sm:text-5xl">Тактический помощник CyberLineup SR</h1>
          <p className="section-copy mt-4 max-w-3xl">
            Ассистент не выдумывает данные. Он ищет только по опубликованным раскидам, группирует результаты по типам гранат и честно сообщает, если нужной записи пока нет.
          </p>
        </div>
      </section>
      <AssistantChat />
    </div>
  );
}
