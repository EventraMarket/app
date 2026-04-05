// Utility functions kept for formatting (Rain SDK removed)

export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

export function formatDate(timestamp: number | string): string {
  const ts = typeof timestamp === "string" ? Number(timestamp) : timestamp;
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

