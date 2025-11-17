import { toast as reactToast } from "react-toastify";
import type { ToastOptions } from "react-toastify";

// Centralized default settings for all toasts
const defaultOptions: ToastOptions = {
    position: "top-left",
    autoClose: 1000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    // theme: "light", // Removed manual theme, will use CSS theme variables
};

function mergeOptions(options?: ToastOptions): ToastOptions {
    return { ...defaultOptions, ...options };
}

export const toast = {
    success: (msg: string, options?: ToastOptions) => reactToast.success(msg, mergeOptions(options)),
    error: (msg: string, options?: ToastOptions) => reactToast.error(msg, mergeOptions(options)),
    info: (msg: string, options?: ToastOptions) => reactToast.info(msg, mergeOptions(options)),
    warning: (msg: string, options?: ToastOptions) => reactToast.warning(msg, mergeOptions(options)),
};
