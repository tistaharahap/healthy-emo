import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Entry } from "@/models/Entry";
import { FEELINGS } from "@/lib/feelings";
import { JOURNAL_TIMEZONE } from "@/lib/dates";
import EntryForm from "@/components/EntryForm";
import Nav from "@/components/Nav";

function formatDateInput(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: JOURNAL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";
  return `${year}-${month}-${day}`;
}

export default async function EditEntryPage({
  params
}: {
  params: { id: string };
}) {
  const session = await requireUser();
  await connectToDatabase();
  const entry = await Entry.findOne({
    _id: params.id,
    userId: session.userId
  }).lean();

  if (!entry) {
    redirect("/entries");
  }

  return (
    <div className="page-shell">
      <Nav username={session.username} />
      <section className="hero">
        <h1>Edit entry</h1>
        <p>Adjust the details to keep your reflection accurate.</p>
      </section>
      <EntryForm
        feelings={FEELINGS}
        entry={{
          id: entry._id.toString(),
          date: formatDateInput(entry.date),
          feelingLabel: entry.feelingLabel,
          reason: entry.reason,
          imageUrl: entry.imageUrl ?? ""
        }}
      />
    </div>
  );
}
