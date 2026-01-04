import { formatMonthLabel, getMonthKey } from "@/lib/dates";

type EntryShape = {
  _id: string;
  date: Date;
  feelingLabel: string;
  feelingScore: number;
  reason: string;
  imageUrl?: string;
};

export type MonthSummary = {
  key: string;
  label: string;
  averageScore: number;
  feelingCounts: Record<string, number>;
  entries: EntryShape[];
};

export function groupEntriesByMonth(entries: EntryShape[]) {
  const grouped = new Map<string, MonthSummary>();

  for (const entry of entries) {
    const key = getMonthKey(entry.date);
    const existing = grouped.get(key);
    if (existing) {
      existing.entries.push(entry);
      existing.averageScore =
        (existing.averageScore * (existing.entries.length - 1) +
          entry.feelingScore) /
        existing.entries.length;
      existing.feelingCounts[entry.feelingLabel] =
        (existing.feelingCounts[entry.feelingLabel] ?? 0) + 1;
    } else {
      grouped.set(key, {
        key,
        label: formatMonthLabel(key),
        averageScore: entry.feelingScore,
        feelingCounts: { [entry.feelingLabel]: 1 },
        entries: [entry]
      });
    }
  }

  return Array.from(grouped.values()).sort((a, b) =>
    a.key > b.key ? -1 : 1
  );
}
