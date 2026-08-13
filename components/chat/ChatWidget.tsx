'use client'

import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import toast from "react-hot-toast";
import { useEffect, useRef } from "react";

export function ChatWidget() {

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onError: (error) => {
      toast.error(error.message || "Algo salió mal, intenta de nuevo");
    },
  });

  const isCooldown = status === "submitted" || status === "streaming";

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full w-full max-w-[640px] flex-col overflow-hidden rounded-none bg-white shadow-[0_20px_60px_rgba(30,30,60,0.12)] dark:bg-slate-900 dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] sm:h-auto sm:rounded-[20px]">
      <ChatHeader onReset={() => setMessages([])} />

      {/* pb extra en mobile para que el último mensaje no quede tapado por el input fixed */}
      <div className="h-full flex-1 overflow-y-auto px-3 py-4 pb-24 sm:h-[560px] sm:flex-none sm:px-5 sm:py-6 sm:pb-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="h-6 w-6 text-slate-400 dark:text-slate-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.06 0-2.077-.163-3.02-.462L3 21l1.5-4.5C3.55 15.16 3 13.63 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Empieza la conversación
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Escribe un mensaje abajo para comenzar
              </p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-full flex-col justify-end gap-3">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isCooldown && <TypingIndicator />}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="fixed inset-x-0 bottom-2 z-10 mx-auto w-full max-w-[640px] px-2 sm:static sm:z-auto sm:mx-0 sm:w-auto sm:px-0 sm:bottom-auto">
        <ChatInput onSend={sendMessage} disabled={isCooldown} />
      </div>
    </div>
  );
}