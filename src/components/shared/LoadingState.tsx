type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = "Loading events..." }: LoadingStateProps) {
  return (
    <div className="border-2 border-dashed border-cacao bg-creamLight p-8 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.15em] text-cacao">{message}</p>
    </div>
  );
}
