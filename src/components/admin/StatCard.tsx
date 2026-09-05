// A single number in a box. This is intentionally as plain as it gets — no
// charts, no graphs, per the project brief ("simple interface giving
// reports", not a fancy analytics dashboard).
export function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-olive/15 bg-cream p-5">
      <p className="font-heading text-xs uppercase tracking-[0.15em] text-olive-dark/60">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl text-olive-dark">{value}</p>
    </div>
  );
}
