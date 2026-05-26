import type { ReactNode } from "react";

type PageShellProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
};

export function PageShell({ eyebrow, title, intro, children }: PageShellProps) {
  return (
    <main className="mx-auto max-w-6xl px-3 py-7 min-[360px]:px-4 sm:px-6 sm:py-12">
      <div className="mb-8 max-w-3xl">
        {eyebrow ? (
          <p className="mb-3 w-fit max-w-full rounded-full border-2 border-ink bg-posterYellow px-3 py-1 text-xs font-black uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl font-black leading-none min-[360px]:text-4xl sm:text-6xl">{title}</h1>
        {intro ? <p className="mt-4 text-base leading-7 text-stone-700 sm:text-lg sm:leading-8">{intro}</p> : null}
      </div>
      {children}
    </main>
  );
}
