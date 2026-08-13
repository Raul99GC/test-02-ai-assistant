"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRef } from "react";

const chatSchema = z.object({
  message: z.string().trim().min(1, { message: "Debes escribir un mensaje para enviarlo" }),
});
type ChatFormValues = z.infer<typeof chatSchema>;

type ChatInputProps = {
  onSend: (message: { text: string }) => void;
  disabled?: boolean;
};

const MAX_HEIGHT_PX = 160;

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isValid },
  } = useForm<ChatFormValues>({
    resolver: zodResolver(chatSchema),
    mode: "onChange",
  });

  const { ref: registerRef, ...rest } = register("message");

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  };

  const onSubmit = async (data: ChatFormValues) => {
    if (disabled) return;
    onSend({ text: data.message });
    reset();
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isValid && !disabled) {
        handleSubmit(onSubmit)();
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex items-end gap-2.5 border-t border-slate-100 px-5 py-3.5 dark:border-slate-800"
    >
      <div className="flex-1">
        <textarea
          placeholder="Escribe un mensaje..."
          rows={1}
          {...rest}
          ref={(el) => {
            registerRef(el);
            textareaRef.current = el;
          }}
          onKeyDown={handleKeyDown}
          onInput={resizeTextarea}
          onChange={(e) => {
            rest.onChange(e);
            resizeTextarea();
          }}
          style={{ maxHeight: MAX_HEIGHT_PX }}
          className="w-full resize-none overflow-y-auto leading-relaxed"
          disabled={isSubmitting || disabled}
          autoComplete="off"
        />
        {errors.message && (
          <p className="mt-1 pl-1 text-[11px] font-medium text-red-500 dark:text-red-400">
            {errors.message.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
        aria-label="Enviar"
        disabled={!isValid || isSubmitting || disabled}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </form>
  );
}