"use client";

 
function RotateCcwIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
 
function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
 
interface ResetConversationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void; // <- aquí conectas tu lógica real (borrar mensajes, llamar API, etc.)
}
 
export function ResetConversationDialog({
  open,
  onClose,
  onConfirm,
}: ResetConversationDialogProps) {
  if (!open) return null;
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2 text-slate-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <RotateCcwIcon size={16} />
            </div>
            <h2 className="text-sm font-semibold">Reiniciar conversación</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <XIcon size={16} />
          </button>
        </div>
 
        <div className="px-5 pt-3 pb-5">
          <p className="text-sm leading-relaxed text-slate-400">
            ¿Seguro que quieres borrar esta conversación? Se perderá todo el
            historial de mensajes y no podrás recuperarlo.
          </p>
        </div>
 
        <div className="flex gap-3 border-t border-slate-800 px-5 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
          >
            Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
}
 