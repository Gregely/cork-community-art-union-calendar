type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = "Loading events..." }: LoadingStateProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-ink bg-white p-8 text-center">
      <p className="font-display text-2xl font-black">{message}</p>
    </div>
  );
}
