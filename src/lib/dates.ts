export const JOURNAL_TIMEZONE = "Asia/Dubai";

export function getUtcDateFromInput(input: string) {
  const [year, month, day] = input.split("-").map(Number);
  if (!year || !month || !day) {
    return new Date();
  }
  return new Date(Date.UTC(year, month - 1, day));
}

export function getMonthKey(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: JOURNAL_TIMEZONE,
    year: "numeric",
    month: "2-digit"
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  return `${year}-${month}`;
}

export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month) {
    return monthKey;
  }
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat("en-US", {
    timeZone: JOURNAL_TIMEZONE,
    month: "long",
    year: "numeric"
  }).format(date);
}
