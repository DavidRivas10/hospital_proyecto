import { useEffect, useState } from "react";

export type DateRange = { from?: string; to?: string }; // ISO (yyyy-MM-dd)

export default function DateRangePicker({
  value, onChange
}: { value: DateRange; onChange: (v: DateRange) => void }) {
  const [from, setFrom] = useState(value.from ?? "");
  const [to, setTo] = useState(value.to ?? "");

  useEffect(() => { onChange({ from, to }); }, [from, to, onChange]);

  function quick(days: number) {
    const now = new Date();
    const d = new Date(now.getTime() - days*24*3600*1000);
    setFrom(d.toISOString().slice(0,10));
    setTo(now.toISOString().slice(0,10));
  }

  return (
    <div className="flex items-center gap-2">
      <input type="date" className="border rounded px-2 py-1" value={from} onChange={(e)=>setFrom(e.target.value)} />
      <span className="text-gray-500">→</span>
      <input type="date" className="border rounded px-2 py-1" value={to} onChange={(e)=>setTo(e.target.value)} />

      <div className="ml-2 flex gap-1">
        <button type="button" className="px-2 py-1 text-xs border rounded" onClick={()=>quick(1)}>Hoy</button>
        <button type="button" className="px-2 py-1 text-xs border rounded" onClick={()=>quick(7)}>7d</button>
        <button type="button" className="px-2 py-1 text-xs border rounded" onClick={()=>quick(30)}>30d</button>
      </div>
    </div>
  );
}
