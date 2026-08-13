import type { UIMessage } from "ai";

interface MessageBubbleProps {
  message: UIMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

  return (
    <div className={`mb-3.5 flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm dark:bg-slate-800">
          🤖
        </div>
      )}

      <div
        className={`max-w-[70%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
          isUser
            ? "rounded-br-[4px] bg-indigo-500 text-white"
            : "rounded-bl-[4px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        }`}
      >
        {text}
      </div>

      {isUser && (
        <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm">
          🧑
        </div>
      )}
    </div>
  );
}