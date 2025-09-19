import type { ReactNode } from "react";

export function Field({
  label,
  error,
  children,
}: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-700 mb-1">{label}</span>
      {children}
      {error && <span className="block text-sm text-red-600 mt-1">{error}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 " +
        (props.className ?? "")
      }
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={
        "w-full rounded border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 " +
        (props.className ?? "")
      }
    />
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={
        "w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 " +
        (props.className ?? "")
      }
    />
  );
}

export function Button({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...rest}
      className={
        "px-3 py-2 rounded bg-brand-600 text-white disabled:opacity-50 " +
        (rest.className ?? "")
      }
    >
      {children}
    </button>
  );
}
