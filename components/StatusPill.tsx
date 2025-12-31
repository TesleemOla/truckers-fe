function StatusPill({ status }: { status?: string }) {
  if (!status) return null;
  const normalized = status.toLowerCase();

  const styles: Record<string, string> = {
    idle: "bg-slate-100 text-slate-800 border-slate-300",
    "in-transit": "bg-amber-50 text-amber-700 border-amber-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const label =
    normalized === "in-transit"
      ? "In transit"
      : normalized.charAt(0).toUpperCase() + normalized.slice(1);

  const className =
    styles[normalized] ??
    "bg-slate-100 text-slate-800 border-slate-300";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export default StatusPill;