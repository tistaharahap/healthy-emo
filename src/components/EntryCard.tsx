"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getFeeling } from "@/lib/feelings";

type EntryCardProps = {
  entry: {
    id: string;
    dateLabel: string;
    feelingLabel: string;
    reason: string;
    imageUrl?: string | null;
  };
};

export default function EntryCard({ entry }: EntryCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const feeling = getFeeling(entry.feelingLabel);

  const handleDelete = async () => {
    if (!confirm("Delete this entry?")) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/entries/${entry.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Delete failed.");
      }

      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Delete failed."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="card">
      <h3>
        {feeling?.emoji ? <span>{feeling.emoji} </span> : null}
        {entry.feelingLabel}
      </h3>
      <p className="meta">{entry.dateLabel}</p>
      <p>{entry.reason}</p>
      {entry.imageUrl && (
        <div className="image-preview">
          <img src={entry.imageUrl} alt={entry.feelingLabel} />
        </div>
      )}
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <a className="pill" href={`/entries/${entry.id}/edit`}>
          Edit
        </a>
        <button className="pill" type="button" onClick={handleDelete}>
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </article>
  );
}
