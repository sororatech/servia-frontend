"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isValidMeetingLink,
  MEETING_LINK_HELP,
  MEETING_LINK_INPUT_PATTERN,
  MEETING_LINK_PLACEHOLDER,
} from "@/lib/meetLink";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  interviewId: string;
  candidateName: string;
  initialMeetLink: string;
};

export default function EditMeetLinkModal({
  isOpen,
  onClose,
  interviewId,
  candidateName,
  initialMeetLink,
}: Props) {
  const router = useRouter();
  const [meetLink, setMeetLink] = useState(initialMeetLink);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setMeetLink(initialMeetLink);
    setError(null);
  }, [isOpen, initialMeetLink]);

  async function handleSubmit() {
    setError(null);

    const trimmedMeetLink = meetLink.trim();
    if (!isValidMeetingLink(trimmedMeetLink)) {
      setError(MEETING_LINK_HELP);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/recruiter/interviews/${interviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meet_link: trimmedMeetLink }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      const payload = contentType.includes("application/json")
        ? ((await res.json()) as { detail?: string; error?: string; meet_link?: string })
        : null;

      if (!res.ok) {
        throw new Error(
          payload?.detail
            ?? payload?.error
            ?? (payload === null ? "Server returned an unexpected response." : "Unable to update meeting link."),
        );
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update meeting link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-3xl bg-[var(--color-warm-surface)] p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-[var(--color-foreground)]">Edit Meeting Link</h2>
        <p className="mt-2 text-sm text-[var(--color-text-subtle)]">
          Update the Google Meet link for {candidateName}. The bot will use the new link on its next run.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--color-foreground)]">
              Meeting Link
            </label>
            <input
              type="url"
              value={meetLink ?? ""}
              onChange={(e) => setMeetLink(e.target.value)}
              required
              placeholder={MEETING_LINK_PLACEHOLDER}
              pattern={MEETING_LINK_INPUT_PATTERN}
              title={MEETING_LINK_HELP}
              className="w-full rounded-full border border-[var(--color-warm-border)] bg-[var(--color-input-bg-light)] px-5 py-3 text-sm text-[var(--color-text-darkest)] placeholder:text-[var(--color-text-subtle)] outline-none focus:border-[var(--color-primary)]"
            />
            <p className="mt-1 text-xs text-[var(--color-text-subtle)]">{MEETING_LINK_HELP}</p>
          </div>

          {error && (
            <p className="text-sm text-[var(--color-status-error-text)]">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-[var(--color-warm-border)] py-3 text-sm font-semibold text-[var(--color-text-dark)] transition hover:border-[var(--color-warm-border-deep)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-full bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
