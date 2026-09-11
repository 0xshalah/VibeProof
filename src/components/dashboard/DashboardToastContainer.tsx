import React from 'react';

export interface ToastItem {
  id: string;
  msg: string;
  tone?: 'cyber' | 'safe' | 'warn' | 'crit';
}

interface DashboardToastContainerProps {
  toasts: ToastItem[];
  onRemoveToast: (id: string) => void;
}

export const DashboardToastContainer: React.FC<DashboardToastContainerProps> = ({
  toasts,
  onRemoveToast
}) => {
  return (
    <div
      id="toastHost"
      className="fixed bottom-5 right-5 z-[70] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => {
        const border =
          t.tone === 'safe'
            ? 'border-safe/60 text-safe'
            : t.tone === 'warn'
            ? 'border-warn/60 text-warn'
            : t.tone === 'crit'
            ? 'border-crit/60 text-crit'
            : 'border-cyber/60 text-cyber';

        return (
          <div
            key={t.id}
            onClick={() => onRemoveToast(t.id)}
            className={`pointer-events-auto rounded-xl border ${border} bg-ink-900/95 px-4 py-3 font-mono text-xs text-white shadow-2xl rise-in flex items-center gap-3 cursor-pointer`}
          >
            <span>{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
};
