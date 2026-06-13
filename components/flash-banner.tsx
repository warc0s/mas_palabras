import { getFlash } from "@/lib/flash";
import type { SearchParams } from "@/lib/types";

export function FlashBanner({ searchParams }: { searchParams: SearchParams }) {
  const flash = getFlash(searchParams);
  if (!flash) {
    return null;
  }

  const tones = {
    success: "border-secondary-500 bg-secondary-50 text-secondary-800",
    error: "border-primary-500 bg-primary-50 text-primary-800",
    warning: "border-accent bg-accent/10 text-[#7a5713]",
    info: "border-neutral-500 bg-neutral-100 text-neutral-800",
  } as const;

  const icon = {
    success: "fa-circle-check",
    error: "fa-circle-exclamation",
    warning: "fa-triangle-exclamation",
    info: "fa-circle-info",
  } as const;

  return (
    <div className="mb-8 animate-rise">
      <div className={`flex items-start gap-3 rounded-xl rounded-l-sm border-l-[3px] px-5 py-4 shadow-paper ${tones[flash.type]}`}>
        <i className={`fa-solid ${icon[flash.type]} mt-0.5`} />
        <p className="text-sm font-medium leading-relaxed">{flash.message}</p>
      </div>
    </div>
  );
}
