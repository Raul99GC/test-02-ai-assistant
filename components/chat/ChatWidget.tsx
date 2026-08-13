'use client'

import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

export function ChatWidget() {

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const isCooldown = status === "submitted" || status === "streaming";

  return (
    <div className="flex w-full max-w-[640px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_20px_60px_rgba(30,30,60,0.12)] dark:bg-slate-900 dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      <ChatHeader onReset={() => setMessages([])} />

      <div className="flex min-h-[360px] flex-col justify-end px-5 py-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isCooldown && <TypingIndicator />}
      </div>

      <ChatInput onSend={sendMessage} disabled={isCooldown} />
    </div>
  );
}