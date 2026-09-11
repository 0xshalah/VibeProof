import React from 'react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const COLOR_MAP: Record<string, string> = {
  cyber: 'border-cyber/60 text-cyber shadow-cyber/20',
  safe: 'border-safe/60 text-safe shadow-safe/20',
  warn: 'border-warn/60 text-warn shadow-warn/20',
  crit: 'border-crit/60 text-crit shadow-crit/20'
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      id="toasts"
      className="fixed bottom-5 right-5 z-[80] space-y-2 w-[calc(100vw-2.5rem)] max-w-sm pointer-events-none"
    >
      {toasts.map((t) => {
        const colorClass = COLOR_MAP[t.type] || COLOR_MAP.cyber;
        return (
          <div
            key={t.id}
            onClick={() => onDismiss(t.id)}
            className={`rise-in pointer-events-auto flex items-start gap-2.5 rounded-xl border ${colorClass} bg-ink-800/95 backdrop-blur px-4 py-3 text-[12.5px] font-medium shadow-lg cursor-pointer`}
          >
            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
            <span className="text-zinc-200">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
};
