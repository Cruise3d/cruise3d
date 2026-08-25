import { useEffect, useRef, useState } from 'react';

const TOAST_EVENT = 'cruise3d:toast';
type ToastKind = 'info' | 'success' | 'error';
type ToastDetail = {
  message: string;
  kind?: ToastKind;
};

export function ToastHost() {
  const [toast, setToast] = useState<ToastDetail | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<ToastDetail>;
      const message = customEvent.detail?.message?.trim();

      if (!message) return;

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      setToast({
        message,
        kind: customEvent.detail?.kind ?? 'info',
      });

      timeoutRef.current = window.setTimeout(() => {
        setToast(null);
        timeoutRef.current = null;
      }, 3500);
    };

    window.addEventListener(TOAST_EVENT, handleToast);

    return () => {
      window.removeEventListener(TOAST_EVENT, handleToast);

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!toast) return null;

  const toneClasses =
    toast.kind === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : toast.kind === 'error'
        ? 'border-red-200 bg-red-50 text-red-900'
        : 'border-slate-200 bg-slate-950 text-white';

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm animate-fade-in">
      <div className={`rounded-2xl border px-4 py-3 shadow-xl ${toneClasses}`}>
        <p className="text-sm font-medium whitespace-pre-line">{toast.message}</p>
      </div>
    </div>
  );
}

export default ToastHost;
