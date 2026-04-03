import { getFlash } from "@/lib/flash";
import type { SearchParams } from "@/lib/types";

export function FlashBanner({ searchParams }: { searchParams: SearchParams }) {
  const flash = getFlash(searchParams);
  if (!flash) {
    return null;
  }

  const tones = {
    success: "border-green-200/50 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800",
    error: "border-red-200/50 bg-gradient-to-r from-red-50 to-rose-50 text-red-800",
    warning: "border-yellow-200/50 bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-800",
    info: "border-blue-200/50 bg-gradient-to-r from-blue-50 to-sky-50 text-blue-800",
  } as const;

  const icon = {
    success: "fa-check",
    error: "fa-exclamation",
    warning: "fa-triangle-exclamation",
    info: "fa-info",
  } as const;

  return (
    <div className="mx-auto mb-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className={`rounded-xl border p-4 shadow-sm ${tones[flash.type]}`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/70">
            <i className={`fa-solid ${icon[flash.type]} text-sm`} />
          </div>
          <p className="text-sm font-medium">{flash.message}</p>
        </div>
      </div>
    </div>
  );
}
