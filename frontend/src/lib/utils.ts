import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCoins(amount: number | bigint): string {
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M coins`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K coins`;
  return `${n} coins`;
}

export function formatDate(timestamp: number | bigint): string {
  const ms = typeof timestamp === "bigint" ? Number(timestamp) / 1_000_000 : timestamp;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTimeRemaining(drawTime: number | bigint): string {
  const ms = typeof drawTime === "bigint" ? Number(drawTime) / 1_000_000 : drawTime;
  const now = Date.now();
  const diff = ms - now;

  if (diff <= 0) return "Draw completed";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function drawIntervalLabel(interval: string): string {
  switch (interval) {
    case "h1": return "Hourly (1h)";
    case "h3": return "Every 3h";
    case "h5": return "Every 5h";
    case "h12": return "Every 12h";
    case "daily": return "Daily";
    case "weekly": return "Weekly";
    default: return interval;
  }
}

export function drawIntervalColor(interval: string): string {
  switch (interval) {
    case "h1":
    case "h3":
    case "h5":
    case "h12":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "daily":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "weekly":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}
