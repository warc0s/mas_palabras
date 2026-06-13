"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="page-card p-10 text-center md:p-14">
        <span className="eyebrow">Error · 500</span>
        <p className="mt-6 font-display text-6xl font-semibold leading-none text-neutral-900 md:text-7xl">
          Algo se torció
        </p>
        <p className="mx-auto mt-6 max-w-md rounded-xl rounded-l-sm border-l-[3px] border-primary-500 bg-primary-50 px-4 py-3 text-left font-mono text-sm text-primary-800">
          Ha ocurrido un error inesperado. Puedes reintentarlo o volver al inicio.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button className="primary-button" onClick={() => reset()} type="button">
            <i className="fa-solid fa-rotate-right" />
            <span>Reintentar</span>
          </button>
          <Link className="outline-button" href="/">
            <i className="fa-solid fa-arrow-left" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
