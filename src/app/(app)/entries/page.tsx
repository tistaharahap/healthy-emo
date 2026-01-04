import { requireUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Entry } from "@/models/Entry";
import Nav from "@/components/Nav";
import EntryCard from "@/components/EntryCard";
import { groupEntriesByMonth } from "@/lib/summary";
import { JOURNAL_TIMEZONE } from "@/lib/dates";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: JOURNAL_TIMEZONE,
  year: "numeric",
  month: "short",
  day: "numeric"
});

export default async function EntriesPage() {
  const session = await requireUser();
  await connectToDatabase();

  const entries = await Entry.find({ userId: session.userId })
    .sort({ date: -1 })
    .lean();

  const mappedEntries = entries.map((entry) => ({
    _id: entry._id.toString(),
    date: entry.date,
    feelingLabel: entry.feelingLabel,
    feelingScore: entry.feelingScore,
    reason: entry.reason,
    imageUrl: entry.imageUrl ?? null
  }));

  const grouped = groupEntriesByMonth(mappedEntries);

  return (
    <div className="page-shell">
      <Nav username={session.username} />
      <section className="hero">
        <h1>Journal check-ins</h1>
        <p>
          Reflect on how you feel, why it happened, and track your emotional
          patterns month by month.
        </p>
      </section>
      {grouped.length === 0 ? (
        <div className="form-card">
          <h3>No entries yet</h3>
          <p className="meta">
            Start your first journal entry to see your monthly summaries.
          </p>
          <a className="pill primary" href="/entries/new">
            Create entry
          </a>
        </div>
      ) : (
        grouped.map((month) => (
          <section key={month.key} className="summary-grid">
            <div className="summary-card">
              <strong>{month.label}</strong>
              <p className="meta">
                Average feeling score: {month.averageScore.toFixed(1)} / 5
              </p>
              <div className="meta">
                {Object.entries(month.feelingCounts).map(([label, count]) => (
                  <span key={label} className="badge">
                    {label}: {count}
                  </span>
                ))}
              </div>
            </div>
            <div className="card-grid">
              {month.entries.map((entry) => (
                <EntryCard
                  key={entry._id}
                  entry={{
                    id: entry._id,
                    dateLabel: dateFormatter.format(entry.date),
                    feelingLabel: entry.feelingLabel,
                    reason: entry.reason,
                    imageUrl: entry.imageUrl
                  }}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
