const badgeStyles: Record<string, string> = {
  Exhibition: "bg-pinkPunch text-white",
  Music: "bg-leeBlue text-white",
  Theatre: "bg-corkRed text-white",
  Film: "bg-ink text-paper",
  Dance: "bg-grass text-white",
  Poetry: "bg-purple-600 text-white",
  Workshop: "bg-posterYellow text-ink",
  Talk: "bg-orange-500 text-white",
  Community: "bg-teal-500 text-white",
  Multidisciplinary: "bg-lime-400 text-ink", // legacy — kept for existing events
};

type DisciplineBadgeProps = {
  discipline: string;
};

export function DisciplineBadge({ discipline }: DisciplineBadgeProps) {
  const style = badgeStyles[discipline] ?? "bg-white text-ink";

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border-2 border-ink px-3 py-1 text-xs font-black uppercase tracking-normal ${style}`}
    >
      {discipline}
    </span>
  );
}
