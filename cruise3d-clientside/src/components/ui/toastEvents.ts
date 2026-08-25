type ToastKind = 'info' | 'success' | 'error';

type ToastDetail = {
  message: string;
  kind?: ToastKind;
};

const TOAST_EVENT = 'cruise3d:toast';

export function showToast(message: string, kind: ToastKind = 'info') {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<ToastDetail>(TOAST_EVENT, {
      detail: { message, kind },
    })
  );
}

