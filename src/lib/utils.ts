import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import ms from "ms";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const NODE_HANDLES_SELECTED_STYLE_CLASSNAME =
  "node-handles-selected-style";

export function isValidUrl(url: string) {
  return /^https?:\/\/\S+$/.test(url);
}

export function randomColor() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 50) + 50; // 50% - 100% saturation
  const l = Math.floor(Math.random() * 40) + 40; // 40% - 80% lightness

  return `hsl(${h}, ${s}%, ${l}%)`;
}

export const PASSWORD_REGEX = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+/);

export const timeAgo = (
  timestamp: Date | null,
  {
    withAgo,
  }: {
    withAgo?: boolean;
  } = {}
): string => {
  if (!timestamp) return "Never";
  const diff = Date.now() - new Date(timestamp).getTime();
  if (diff < 1000) {
    // less than 1 second
    return "Just now";
  } else if (diff > 82800000) {
    // more than 23 hours – similar to how Twitter displays timestamps
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return `${ms(diff)}${withAgo ? " ago" : ""}`;
};
