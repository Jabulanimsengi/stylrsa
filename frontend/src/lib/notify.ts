import { toast, type Id, type ToastOptions } from 'react-toastify';

type NotifyVariant = 'success' | 'error' | 'info' | 'warning';

const baseOptions: ToastOptions = {
  position: 'top-right',
  closeOnClick: true,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
  draggable: false,
};

const variantOptions: Record<NotifyVariant, ToastOptions> = {
  success: { autoClose: 3200 },
  error: { autoClose: 5200 },
  info: { autoClose: 2800 },
  warning: { autoClose: 4200 },
};

function show(variant: NotifyVariant, message: string, options?: ToastOptions): Id {
  const mergedOptions = {
    ...baseOptions,
    ...variantOptions[variant],
    ...options,
  };

  switch (variant) {
    case 'success':
      return toast.success(message, mergedOptions);
    case 'error':
      return toast.error(message, mergedOptions);
    case 'warning':
      return toast.warn(message, mergedOptions);
    default:
      return toast.info(message, mergedOptions);
  }
}

export const notify = {
  success: (message: string, options?: ToastOptions) => show('success', message, options),
  error: (message: string, options?: ToastOptions) => show('error', message, options),
  info: (message: string, options?: ToastOptions) => show('info', message, options),
  warning: (message: string, options?: ToastOptions) => show('warning', message, options),
  dismiss: (id?: Id) => toast.dismiss(id),
};
