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
      ? 'border-[#bbdec5] bg-[#f0f8f2] text-[#14532d]'
      : toast.kind === 'error'
        ? 'border-[#f0caca] bg-[#fff5f5] text-[#7f1d1d]'
        : 'border-[#404040] bg-[#1a1a1a] text-white';

  return (
    <div className="fixed inset-x-4 bottom-4 z-[100] max-w-sm animate-fade-in sm:inset-x-auto sm:right-6 sm:bottom-6">
      <div className={`rounded-xl border px-4 py-3 shadow-xl ${toneClasses}`}>
        <p className="text-sm font-medium whitespace-pre-line">{toast.message}</p>
      </div>
    </div>
  );
}

export default ToastHost;
