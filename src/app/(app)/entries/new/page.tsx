import { requireUser } from "@/lib/auth";
import { FEELINGS } from "@/lib/feelings";
import { JOURNAL_TIMEZONE } from "@/lib/dates";
import EntryForm from "@/components/EntryForm";
import Nav from "@/components/Nav";

function getTodayInputValue() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: JOURNAL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";
  return `${year}-${month}-${day}`;
}

export default async function NewEntryPage() {
  const session = await requireUser();
  const today = getTodayInputValue();

  return (
    <div className="page-shell">
      <Nav username={session.username} />
      <section className="hero">
        <h1>New journal entry</h1>
        <p>Pick a feeling, explain why, and add a memory photo if you want.</p>
      </section>
      <EntryForm feelings={FEELINGS} initialDate={today} />
    </div>
  );
}
