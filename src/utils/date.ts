export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-IE", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T12:00:00`));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatTimeRange(start: string, end?: string | null) {
  return end ? `${start} - ${end}` : start;
}

export function sortByDate<T extends { event_date: string; start_time: string }>(events: T[]) {
  return [...events].sort((a, b) =>
    `${a.event_date}T${a.start_time}`.localeCompare(`${b.event_date}T${b.start_time}`),
  );
}
