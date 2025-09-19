export function KPI({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card card-surface p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}
