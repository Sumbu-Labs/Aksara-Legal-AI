'use client';

import type { JSX } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type ToastVariant = 'success' | 'error' | 'info';

type ToastState = 'entering' | 'visible' | 'exiting';

type ToastDefinition = {
  id: string;
  message: string;
  variant: ToastVariant;
  state: ToastState;
};

type ToastMethods = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastMethods | undefined>(undefined);

const TOAST_DURATION = 4500;
const EXIT_ANIMATION_DURATION = 220;

export function ToastProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [toasts, setToasts] = useState<ToastDefinition[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const exitTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const beginDismiss = useCallback((id: string) => {
    const activeTimer = timers.current.get(id);
    if (activeTimer) {
      clearTimeout(activeTimer);
      timers.current.delete(id);
    }

    if (exitTimers.current.has(id)) {
      return;
    }

    setToasts((previous) =>
      previous.map((toast) => (toast.id === id ? { ...toast, state: 'exiting' } : toast)),
    );

    const exitTimer = setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
      exitTimers.current.delete(id);
    }, EXIT_ANIMATION_DURATION);

    exitTimers.current.set(id, exitTimer);
  }, []);

  const removeToast = useCallback((id: string) => {
    beginDismiss(id);
  }, [beginDismiss]);

  const pushToast = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

      setToasts((previous) => [...previous, { id, message, variant, state: 'entering' }]);

      requestAnimationFrame(() => {
        setToasts((previous) =>
          previous.map((toast) =>
            toast.id === id && toast.state === 'entering'
              ? { ...toast, state: 'visible' }
              : toast,
          ),
        );
      });

      const timeoutId = setTimeout(() => {
        beginDismiss(id);
      }, TOAST_DURATION);
      timers.current.set(id, timeoutId);
    },
    [beginDismiss],
  );

  useEffect(() => {
    const timersMap = timers.current;
    const exitTimersMap = exitTimers.current;
    return () => {
      const activeTimers = Array.from(timersMap.values());
      timersMap.clear();
      activeTimers.forEach((timerId) => clearTimeout(timerId));

      const activeExitTimers = Array.from(exitTimersMap.values());
      exitTimersMap.clear();
      activeExitTimers.forEach((timerId) => clearTimeout(timerId));
    };
  }, []);

  const contextValue = useMemo<ToastMethods>(
    () => ({
      success: (message: string) => pushToast('success', message),
      error: (message: string) => pushToast('error', message),
      info: (message: string) => pushToast('info', message),
    }),
    [pushToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastStack toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastMethods {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast harus digunakan di dalam ToastProvider');
  }
  return context;
}

function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastDefinition[];
  onDismiss: (id: string) => void;
}): JSX.Element {
  return (
    <div className="pointer-events-none fixed left-0 right-0 top-4 z-[1050] flex flex-col items-center gap-3 px-4 sm:items-end">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border-2 border-black px-4 py-3 text-sm font-semibold shadow-lg transition-all duration-200 ease-out ${getVariantClasses(toast.variant)} ${getStateClasses(toast.state)}`}
        >
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="text-xs font-semibold uppercase tracking-wide text-white underline-offset-2 hover:underline"
          >
            Tutup
          </button>
        </div>
      ))}
    </div>
  );
}

function getVariantClasses(variant: ToastVariant): string {
  if (variant === 'success') {
    return 'bg-[var(--color-success,#16a34a)] text-white';
  }
  if (variant === 'error') {
    return 'bg-[var(--color-danger,#dc2626)] text-white';
  }
  return 'bg-[var(--color-primary-dark,#0d2a36)] text-white';
}

function getStateClasses(state: ToastState): string {
  if (state === 'entering') {
    return 'translate-y-2 opacity-0';
  }
  if (state === 'exiting') {
    return 'translate-y-2 opacity-0 scale-[0.97]';
  }
  return 'translate-y-0 opacity-100';
}
