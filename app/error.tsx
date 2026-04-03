"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="page-card p-12 text-center">
        <div className="mb-6 text-6xl text-red-500">
          <i className="fa-solid fa-triangle-exclamation" />
        </div>
        <h1 className="mb-4 text-3xl font-bold text-neutral-900">Error interno del servidor</h1>
        <p className="mb-8 text-neutral-600">{error.message || "Ha ocurrido un error inesperado."}</p>
        <div className="flex justify-center gap-4">
          <button className="primary-button" onClick={() => reset()} type="button">
            Reintentar
          </button>
          <Link className="secondary-button" href="/">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
