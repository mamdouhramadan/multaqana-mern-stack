import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { siteConfig } from "@/config/site";

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";

  // Check if running on localhost
  const isLocal = typeof window !== "undefined" && window.location.hostname.includes("localhost");

  // Check if it's already an absolute URL (http/https) or contains siteUrl
  const isAbsolute = path.startsWith("http") || path.startsWith("https");
  const containsSiteUrl = path.includes(siteConfig.siteUrl);

  if (isLocal && !isAbsolute && !containsSiteUrl) {
    // Remove leading slash from path to avoid double slashes if siteUrl doesn't end with one (checked manually or handled)
    // siteUrl in config doesn't have trailing slash usually.
    // But let's be safe.
    const baseUrl = siteConfig.siteUrl.replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    console.log(baseUrl, cleanPath);
    return `${baseUrl}${cleanPath}`;
  }

  return path;
}
