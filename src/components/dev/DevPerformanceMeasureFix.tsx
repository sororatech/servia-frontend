"use client";

import { useEffect } from "react";

type PerformanceWithPatch = Performance & {
  __negativeTimestampPatched?: boolean;
};

/**
 * Next.js dev mode can throw when React aborts a server render during
 * client navigation (negative performance.measure timestamp). Swallow that
 * specific dev-only error so navigation still works.
 */
export default function DevPerformanceMeasureFix() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const perf = window.performance as PerformanceWithPatch | undefined;
    if (!perf || typeof perf.measure !== "function" || perf.__negativeTimestampPatched) {
      return;
    }

    const originalMeasure = perf.measure.bind(perf);
    perf.measure = (...args: Parameters<Performance["measure"]>) => {
      try {
        return originalMeasure(...args);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("negative time stamp")) {
          return undefined;
        }
        throw error;
      }
    };
    perf.__negativeTimestampPatched = true;
  }, []);

  return null;
}
