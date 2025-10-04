import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (
    type: ToastType,
    title: string,
    description?: string,
    duration?: number,
  ) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: ToastType, title: string, description?: string, duration = 5000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = { id, type, title, description, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, clearToasts }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800";
      case "error":
        return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800";
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case "success":
        return "text-green-800 dark:text-green-200";
      case "error":
        return "text-red-800 dark:text-red-200";
      case "warning":
        return "text-yellow-800 dark:text-yellow-200";
      case "info":
        return "text-blue-800 dark:text-blue-200";
    }
  };

  return (
    <div
      className={`
        flex items-start p-4 rounded-lg border shadow-lg backdrop-blur-sm
        transform transition-all duration-300 ease-in-out
        animate-in slide-in-from-right-2 fade-in-0
        ${getBgColor()}
      `}
    >
      <div className="flex-shrink-0 mr-3">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-semibold ${getTextColor()}`}>
          {toast.title}
        </h4>
        {toast.description && (
          <p className={`text-sm mt-1 ${getTextColor()} opacity-80`}>
            {toast.description}
          </p>
        )}
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className={`
          flex-shrink-0 ml-3 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10
          transition-colors duration-200
        `}
      >
        <X className="h-4 w-4 opacity-60" />
      </button>
    </div>
  );
};

// Funções de conveniência
export const toast = {
  success: (_title: string, _description?: string) => {
    // Esta função será implementada no hook
    throw new Error(
      "toast.success must be called within a component that uses useToast",
    );
  },
  error: (_title: string, _description?: string) => {
    throw new Error(
      "toast.error must be called within a component that uses useToast",
    );
  },
  warning: (_title: string, _description?: string) => {
    throw new Error(
      "toast.warning must be called within a component that uses useToast",
    );
  },
  info: (_title: string, _description?: string) => {
    throw new Error(
      "toast.info must be called within a component that uses useToast",
    );
  },
};
