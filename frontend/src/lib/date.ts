import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatTimestamp(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d, yyyy HH:mm:ss");
  } catch {
    return iso;
  }
}

export function formatRelativeTime(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}
