import type { PropsWithChildren } from "react";

export function TableWrap({ children }: PropsWithChildren) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function T({ children }: PropsWithChildren) {
  return <table className="min-w-full border-separate border-spacing-0 text-sm">{children}</table>;
}
export const Th = ({ children }: PropsWithChildren) =>
  <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-left font-medium text-slate-700 first:pl-4 last:pr-4">{children}</th>;
export const Td = ({ children }: PropsWithChildren) =>
  <td className="border-b border-slate-100 px-3 py-2 text-slate-700 first:pl-4 last:pr-4">{children}</td>;
export const Tr = ({ children }: PropsWithChildren) =>
  <tr className="hover:bg-slate-50/60">{children}</tr>;
