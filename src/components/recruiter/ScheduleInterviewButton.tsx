"use client";

import { useState } from "react";
import ScheduleInterviewModal from "./ScheduleInterviewModal";

export default function ScheduleInterviewButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-hover)]"
      >
        + Schedule Interview
      </button>
      <ScheduleInterviewModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
