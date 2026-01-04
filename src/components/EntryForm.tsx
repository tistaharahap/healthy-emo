"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { FeelingOption } from "@/lib/feelings";

type EntryFormProps = {
  entry?: {
    id: string;
    date: string;
    feelingLabel: string;
    reason: string;
    imageUrl?: string | null;
  };
  initialDate?: string;
  feelings: FeelingOption[];
};

export default function EntryForm({
  entry,
  feelings,
  initialDate
}: EntryFormProps) {
  const router = useRouter();
  const [date, setDate] = useState(entry?.date ?? initialDate ?? "");
  const [feelingLabel, setFeelingLabel] = useState(entry?.feelingLabel ?? "");
  const [reason, setReason] = useState(entry?.reason ?? "");
  const [imageUrl, setImageUrl] = useState(entry?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type
        })
      });

      if (!response.ok) {
        throw new Error("Upload link failed.");
      }

      const { uploadUrl, publicUrl } = (await response.json()) as {
        uploadUrl: string;
        publicUrl: string;
      };

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type
        },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error("Image upload failed.");
      }

      setImageUrl(publicUrl);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!date || !feelingLabel || !reason.trim()) {
      setError("Date, feeling, and reason are required.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        entry ? `/api/entries/${entry.id}` : "/api/entries",
        {
          method: entry ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            feelingLabel,
            reason: reason.trim(),
            imageUrl: imageUrl || null
          })
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "Save failed.");
      }

      router.push("/entries");
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Save failed."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form-card form-grid" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>
        <div>
          <label>Feeling</label>
          <div className="feeling-grid" role="list">
            {feelings.map((feeling) => {
              const selected = feeling.label === feelingLabel;
              return (
                <button
                  key={feeling.label}
                  type="button"
                  className={`feeling-option${selected ? " selected" : ""}`}
                  style={{ borderColor: selected ? feeling.color : undefined }}
                  onClick={() => setFeelingLabel(feeling.label)}
                  aria-pressed={selected}
                >
                  <span className="feeling-emoji">{feeling.emoji}</span>
                  <span className="feeling-label">{feeling.label}</span>
                </button>
              );
            })}
          </div>
          {feelingLabel ? (
            <p className="meta">Selected: {feelingLabel}</p>
          ) : (
            <p className="meta">Tap an emoji that matches today.</p>
          )}
        </div>
        <div>
          <label htmlFor="reason">Reason</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="What made you feel this way?"
            required
          />
        </div>
        <div>
          <label htmlFor="image">Optional image</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {uploading && <p className="meta">Uploading image…</p>}
          {imageUrl && !uploading && (
            <div className="image-preview">
              <img src={imageUrl} alt="Entry preview" />
            </div>
          )}
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button
          className="pill primary"
          type="submit"
          disabled={saving || uploading}
        >
          {saving ? "Saving…" : entry ? "Update Entry" : "Save Entry"}
        </button>
        <a className="pill" href="/entries">
          Cancel
        </a>
      </div>
    </form>
  );
}
