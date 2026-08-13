"use client";

import { useState } from "react";
import type { UIMessage } from "ai";

interface MessageBubbleProps {
  message: UIMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className={`mb-3.5 flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm dark:bg-slate-800">
          🤖
        </div>
      )}

      <div className={`group flex max-w-[70%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
            isUser
              ? "rounded-br-[4px] bg-indigo-500 text-white"
              : "rounded-bl-[4px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {text}
        </div>

        {!isUser && (
          <button
            type="button"
            onClick={handleCopy}
            className="mt-1 flex items-center gap-1 rounded-md px-1.5 py-1 text-slate-400 opacity-0 transition-opacity duration-150 hover:text-slate-600 group-hover:opacity-100 dark:hover:text-slate-300"
            aria-label="Copy message"
          >
            {copied ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
            {copied && <span className="text-[11px]">Copiado</span>}
          </button>
        )}
      </div>

      {isUser && (
        <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm">
          🧑
        </div>
      )}
    </div>
  );
}