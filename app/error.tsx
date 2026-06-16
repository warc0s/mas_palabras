"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="page-card p-10 text-center md:p-14">
        <span className="eyebrow">Error · 500</span>
        <p className="mt-6 font-display text-6xl font-semibold leading-none text-neutral-900 md:text-7xl">
          Something went wrong
        </p>
        <p className="mx-auto mt-6 max-w-md rounded-xl rounded-l-sm border-l-[3px] border-primary-500 bg-primary-50 px-4 py-3 text-left font-mono text-sm text-primary-800">
          An unexpected error occurred. You can try again or return home.
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-xs uppercase tracking-wide text-neutral-400">
            Identifier: {error.digest}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button className="primary-button" onClick={() => reset()} type="button">
            <i className="fa-solid fa-rotate-right" />
            <span>Retry</span>
          </button>
          <Link className="outline-button" href="/">
            <i className="fa-solid fa-arrow-left" />
            <span>Back home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
