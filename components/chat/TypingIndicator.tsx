export function TypingIndicator() {
  return (
    <div className="mb-3.5 flex items-end justify-start gap-2">
      <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm dark:bg-slate-800">
        🤖
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-[4px] bg-slate-100 px-4 py-3 dark:bg-slate-800">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:0ms] dark:bg-slate-600" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:150ms] dark:bg-slate-600" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:300ms] dark:bg-slate-600" />
      </div>
    </div>
  );
}