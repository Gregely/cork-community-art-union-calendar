type ErrorStateProps = {
  title?: string;
  message: string;
};

export function ErrorState({ title = "Something needs attention", message }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-corkRed p-6 text-white shadow-poster">
      <h2 className="font-display text-2xl font-black">{title}</h2>
      <p className="mt-3 text-sm leading-6">{message}</p>
    </div>
  );
}
