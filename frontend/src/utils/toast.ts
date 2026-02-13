import { toast, ToastOptions } from "react-toastify";


export const showErrorToast = (message: string, id?: string | number) => {
    let toastId = id;

    if (!toastId) {
        if (message.toLowerCase().includes("unauthorized")) {
            toastId = "auth-error";
        } else if (message.toLowerCase().includes("too many requests") || message.toLowerCase().includes("throttle")) {
            toastId = "throttle-error";
        } else {
            toastId = message;
        }
    }

    toast.error(message, {
        toastId,
    } as ToastOptions);
};

export const showSuccessToast = (message: string | undefined, id?: string | number) => {
    const msg = message || "Success";
    const toastId = id || msg;
    toast.success(msg, {
        toastId,
    } as ToastOptions);
};
