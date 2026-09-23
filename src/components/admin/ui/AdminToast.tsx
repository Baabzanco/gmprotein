import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

let toastListeners: ((toasts: ToastItem[]) => void)[] = [];
let currentToasts: ToastItem[] = [];

export const showToast = (message: string, type: ToastType = "success") => {
  const id = `toast-${Date.now()}-${Math.random()}`;
  currentToasts = [...currentToasts, { id, type, message }];
  toastListeners.forEach((fn) => fn(currentToasts));

  setTimeout(() => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    toastListeners.forEach((fn) => fn(currentToasts));
  }, 4000);
};

export const useAdminToast = () => {
  return {
    showToast,
    showSuccess: (msg: string) => showToast(msg, "success"),
    showError: (msg: string) => showToast(msg, "error"),
    showWarning: (msg: string) => showToast(msg, "warning"),
    showInfo: (msg: string) => showToast(msg, "info"),
  };
};

export const AdminToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== setToasts);
    };
  }, []);

  const removeToast = (id: string) => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    toastListeners.forEach((fn) => fn(currentToasts));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
          warning: <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />,
          info: <Info className="w-4 h-4 text-sky-500 shrink-0" />,
        };

        const borders = {
          success: "border-emerald-500/30",
          error: "border-rose-500/30",
          warning: "border-amber-500/30",
          info: "border-sky-500/30",
        };

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 bg-white dark:bg-slate-900 border ${borders[t.type]} shadow-xl rounded-xl text-slate-800 dark:text-slate-100 text-xs animate-in slide-in-from-bottom-2 fade-in duration-200`}
          >
            <div className="flex items-center gap-2.5">
              {icons[t.type]}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
