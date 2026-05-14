"use client";

type AIScoreBadgeProps = {
  score: number | null;
};

export default function AIScoreBadge({ score }: AIScoreBadgeProps) {
  const label = score === null ? "N/A" : String(score);
  const toneClass =
    score === null
      ? "border-[#ddd7d3] bg-[#f4efeb] text-[#7d746d]"
      : score >= 85
        ? "border-[#c8ece6] bg-[#ecfbf8] text-[#11796a]"
        : score >= 70
          ? "border-[#eadfb2] bg-[#fff9df] text-[#8a6a07]"
          : "border-[#f2d2ca] bg-[#fff1ed] text-[#9a4c33]";

  return (
    <span
      className={`inline-flex min-w-14 justify-center rounded-full border px-3 py-1 text-sm font-semibold ${toneClass}`}
    >
      {label}
    </span>
  );
}
