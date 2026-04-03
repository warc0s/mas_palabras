import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="page-card p-12 text-center">
        <div className="mb-6 text-6xl text-blue-500">
          <i className="fa-solid fa-compass" />
        </div>
        <h1 className="mb-4 text-3xl font-bold text-neutral-900">Página no encontrada</h1>
        <p className="mb-8 text-neutral-600">La ruta que buscas no existe o ya no está disponible.</p>
        <Link className="primary-button" href="/">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
