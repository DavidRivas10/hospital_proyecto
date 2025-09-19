import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Toast = { id: string; kind: "success"|"error"|"info"; message: string; ttl?: number };

const ToastCtx = createContext<{
  push: (t: Omit<Toast, "id">) => void;
}>({ push: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const timers = useRef<Record<string, any>>({});

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    const ttl = t.ttl ?? 3000;
    setItems((arr) => [...arr, { ...t, id, ttl }]);
    timers.current[id] = setTimeout(() => {
      setItems((arr) => arr.filter((x) => x.id !== id));
      delete timers.current[id];
    }, ttl);
  }, []);

  useEffect(() => () => { Object.values(timers.current).forEach(clearTimeout); }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed z-50 right-3 top-3 flex flex-col gap-2">
          {items.map((t) => (
            <div key={t.id}
              className={
                "rounded px-3 py-2 shadow text-sm " +
                (t.kind === "success" ? "bg-green-600 text-white"
                 : t.kind === "error" ? "bg-red-600 text-white"
                 : "bg-gray-800 text-white")
              }>
              {t.message}
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
