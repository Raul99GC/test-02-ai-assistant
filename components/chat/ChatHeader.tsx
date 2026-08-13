"use client";
import { useState } from "react";
import { ResetConversationDialog } from "./ResetConversationDialog";

interface ChatHeaderProps {
  onReset: () => void;
}

export function ChatHeader({ onReset }: ChatHeaderProps) {

  const handleClick = () => {
    onReset();
  }

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">

        <h2>Medico generico a tu disposicion :D</h2>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-none bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700"
          aria-label="Cerrar"
          title="Resetear"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
      <ResetConversationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleClick}
      />
    </>
  );
}