type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="border-2 border-dashed border-cacao bg-creamLight p-8 text-center">
      <h2 className="font-display text-2xl font-black text-ink">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl font-mono text-sm text-cacaoMid">{message}</p>
    </div>
  );
}
