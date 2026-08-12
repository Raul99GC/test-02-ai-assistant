import { ChatWidget } from "@/components/chat/ChatWidget";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50 px-4 py-10 dark:from-slate-950 dark:to-slate-900">
      <ChatWidget />
    </main>
  );
}