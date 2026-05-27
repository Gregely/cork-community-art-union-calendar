type ErrorStateProps = {
  title?: string;
  message: string;
};

export function ErrorState({ title = "Something needs attention", message }: ErrorStateProps) {
  return (
    <div className="border-2 border-corkRed bg-creamLight p-6 shadow-paste">
      <h2 className="font-display text-2xl font-black text-corkRed">{title}</h2>
      <p className="mt-3 font-mono text-sm leading-6 text-cacaoMid">{message}</p>
    </div>
  );
}
