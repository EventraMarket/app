// MarketsContext is no longer needed — Azuro SDK's useGames hook
// replaces the Rain-based market fetching. This file is kept as a
// re-export for any components that still reference useMarkets.

export { useGames as useMarkets } from "@azuro-org/sdk";

