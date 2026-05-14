"use client";

import { useState } from "react";

type ScheduleTarget = { candidateId: string; jobId: string } | null;

export function useScheduleInterview() {
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleTarget>(null);

  function openFor(candidateId: string, jobId: string) {
    setScheduleTarget({ candidateId, jobId });
  }

  function close() {
    setScheduleTarget(null);
  }

  return {
    scheduleTarget,
    openFor,
    close,
    isOpen: scheduleTarget !== null,
  };
}
