import type { ReactNode } from "react";

type PageShellProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
};

export function PageShell({ eyebrow, title, intro, children }: PageShellProps) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 max-w-3xl">
        {eyebrow ? (
          <p
            className="mb-3 inline-flex items-center border-2 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{
              color: "#b8421f",
              borderColor: "#b8421f",
              boxShadow: "0 0 0 2px #f1e4c8, 0 0 0 3.5px #b8421f",
            }}
          >
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-4xl font-black leading-none text-ink min-[360px]:text-5xl sm:text-6xl">
          {title}
        </h1>
        {intro ? (
          <p className="mt-4 text-base leading-relaxed text-cacaoMid sm:text-lg">{intro}</p>
        ) : null}
      </div>
      {children}
    </main>
  );
}
