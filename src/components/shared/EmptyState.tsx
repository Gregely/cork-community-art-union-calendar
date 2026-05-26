type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-ink bg-white p-8 text-center">
      <h2 className="font-display text-2xl font-black">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-stone-700">{message}</p>
    </div>
  );
}
