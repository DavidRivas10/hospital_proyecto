export default function EmptyState({ title="Sin datos", subtitle="Intenta cambiar el filtro o crear un registro nuevo.", action }: {title?:string; subtitle?:string; action?:React.ReactNode}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
      <h3 className="text-sm font-medium text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
