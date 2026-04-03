import { redirect } from "next/navigation";

import type { FlashType, SearchParams } from "@/lib/types";

export function buildFlashUrl(path: string, type: FlashType, message: string): string {
  const [pathname, rawQuery] = path.split("?");
  const params = new URLSearchParams(rawQuery ?? "");
  params.set("status", type);
  params.set("message", message);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function redirectWithFlash(path: string, type: FlashType, message: string): never {
  redirect(buildFlashUrl(path, type, message));
}

export function getFlash(searchParams: SearchParams): { type: FlashType; message: string } | null {
  const rawType = getSingleParam(searchParams, "status");
  const message = getSingleParam(searchParams, "message");

  if (!rawType || !message) {
    return null;
  }

  if (!["success", "error", "warning", "info"].includes(rawType)) {
    return null;
  }

  return { type: rawType as FlashType, message };
}

export function getSingleParam(searchParams: SearchParams, key: string): string | undefined {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export async function resolveSearchParams(
  searchParams?: Promise<SearchParams> | SearchParams,
): Promise<SearchParams> {
  if (!searchParams) {
    return {};
  }

  if (typeof (searchParams as Promise<SearchParams>).then === "function") {
    return searchParams as Promise<SearchParams>;
  }

  return searchParams as SearchParams;
}
