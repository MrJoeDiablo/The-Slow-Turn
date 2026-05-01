export function SectionHeading({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="text-center mb-14">
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">{children}</h2>
    </div>
  );
}