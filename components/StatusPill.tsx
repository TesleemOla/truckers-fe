function StatusPill({ status }: { status?: string }) {
  if (!status) return null;
  const normalized = status.toLowerCase();

  const styles: Record<string, string> = {
    idle: "bg-slate-800 text-slate-100 border-slate-700",
    "in-transit": "bg-amber-500/15 text-amber-300 border-amber-500/50",
    completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/50",
  };

  const label =
    normalized === "in-transit"
      ? "In transit"
      : normalized.charAt(0).toUpperCase() + normalized.slice(1);

  const className =
    styles[normalized] ??
    "bg-slate-800 text-slate-100 border-slate-700";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export default StatusPill;