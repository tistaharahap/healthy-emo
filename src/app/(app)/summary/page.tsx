import { requireUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Entry } from "@/models/Entry";
import Nav from "@/components/Nav";
import { groupEntriesByMonth } from "@/lib/summary";
import type { Types } from "mongoose";
import type { EntryDocument } from "@/models/Entry";

export default async function SummaryPage() {
  const session = await requireUser();
  await connectToDatabase();

  const entries = await Entry.find({ userId: session.userId })
    .sort({ date: -1 })
    .lean<(EntryDocument & { _id: Types.ObjectId })[]>();

  const mappedEntries = entries.map((entry) => ({
    _id: entry._id.toString(),
    date: entry.date,
    feelingLabel: entry.feelingLabel,
    feelingScore: entry.feelingScore,
    reason: entry.reason,
    imageUrl: entry.imageUrl ?? undefined
  }));

  const grouped = groupEntriesByMonth(mappedEntries);

  return (
    <div className="page-shell">
      <Nav username={session.username} />
      <section className="hero">
        <h1>Monthly trends</h1>
        <p>
          A quick view of how your feelings balance out month by month.
        </p>
      </section>
      {grouped.length === 0 ? (
        <div className="form-card">
          <h3>No entries yet</h3>
          <p className="meta">Add an entry to see monthly averages.</p>
          <a className="pill primary" href="/entries/new">
            Create entry
          </a>
        </div>
      ) : (
        <div className="summary-grid">
          {grouped.map((month) => (
            <div key={month.key} className="summary-card">
              <h3>{month.label}</h3>
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
          ))}
        </div>
      )}
    </div>
  );
}
