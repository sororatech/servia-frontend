"use client";

type AIScoreBadgeProps = {
  score: number | null;
};

export default function AIScoreBadge({ score }: AIScoreBadgeProps) {
  const label = score === null ? "N/A" : String(score);
  const toneClass =
    score === null
      ? "border-[var(--color-warm-border-light)] bg-[var(--color-warm-surface)] text-[var(--color-text-subtle)]"
      : score >= 85
        ? "border-[var(--color-teal-border)] bg-[var(--color-teal-light)] text-[var(--color-teal-dark)]"
        : score >= 70
          ? "border-[var(--color-status-warning-border)] bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)]"
          : "border-[var(--color-status-error-border)] bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]";

  return (
    <span
      className={`inline-flex min-w-14 justify-center rounded-full border px-3 py-1 text-sm font-semibold ${toneClass}`}
    >
      {label}
    </span>
  );
}
