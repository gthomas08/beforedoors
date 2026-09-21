import { useSyncExternalStore } from "react";

export type TrackedReport = {
  reportId: string;
  url: string;
  startedAt: number;
};

const STORAGE_KEY = "beforedoors:tracked-report:v1";
const EMPTY_REPORT: TrackedReport | null = null;
const listeners = new Set<() => void>();
let snapshot: TrackedReport | null | undefined;

function readReport(): TrackedReport | null {
  if (typeof window === "undefined") return EMPTY_REPORT;

  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");

    if (!value || typeof value !== "object") return EMPTY_REPORT;

    const report = value as Partial<TrackedReport>;
    if (
      typeof report.reportId !== "string" ||
      typeof report.url !== "string" ||
      typeof report.startedAt !== "number"
    ) {
      return EMPTY_REPORT;
    }

    return {
      reportId: report.reportId,
      url: report.url,
      startedAt: report.startedAt,
    };
  } catch {
    return EMPTY_REPORT;
  }
}

function getSnapshot() {
  snapshot ??= readReport();
  return snapshot;
}

function notify() {
  for (const listener of listeners) listener();
}

function setReport(report: TrackedReport | null) {
  snapshot = report;

  if (typeof window !== "undefined") {
    try {
      if (report === null) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(report));
      }
    } catch {
      // The UI should keep working if browser storage is unavailable.
    }
  }

  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    snapshot = readReport();
    notify();
  };

  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function useTrackedReport() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_REPORT);
}

export function rememberReport(report: Omit<TrackedReport, "startedAt">) {
  const current = getSnapshot();
  if (current?.reportId === report.reportId && current.url === report.url) return;

  setReport({ ...report, startedAt: Date.now() });
}

export function forgetReport(reportId: string) {
  if (getSnapshot()?.reportId !== reportId) return;
  setReport(null);
}
