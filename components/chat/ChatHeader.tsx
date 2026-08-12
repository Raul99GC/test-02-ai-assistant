export function ChatHeader() {
  return (
    <div className="flex items-center justify-end border-b border-slate-100 px-5 py-4 dark:border-slate-800">
      <button
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-none bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700"
        aria-label="Cerrar"
        title="Resetear"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}