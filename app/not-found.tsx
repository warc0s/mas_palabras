import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="page-card p-10 text-center md:p-14">
        <span className="eyebrow">Error · 404</span>
        <p className="mt-6 font-display text-7xl font-semibold leading-none text-neutral-900 md:text-8xl">
          404
        </p>
        <p className="mt-4 font-mono text-sm uppercase tracking-widest text-neutral-400">
          /pá·gi·na/ · no encontrada
        </p>
        <p className="mx-auto mt-6 max-w-md text-neutral-600">
          Esta entrada no figura en el diccionario. Puede que la ruta haya cambiado o ya no exista.
        </p>
        <Link className="primary-button mt-8" href="/">
          <i className="fa-solid fa-arrow-left" />
          <span>Volver al inicio</span>
        </Link>
      </div>
    </div>
  );
}
