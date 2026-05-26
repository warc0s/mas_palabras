"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { bulkDeleteWordsAction, deleteWordAction } from "@/lib/actions/word-actions";

type WordRow = {
  id: number;
  englishWord: string;
  translation: string;
  explanation: string;
  language: string;
  tag: string;
  timesPracticed: number;
  accuracy: number;
  needsPractice: boolean;
};

export function WordsTable({ words }: { words: WordRow[] }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();
  const allSelected = useMemo(
    () => words.length > 0 && selectedIds.length === words.length,
    [selectedIds.length, words.length],
  );

  function toggleAll() {
    setSelectedIds(allSelected ? [] : words.map((word) => word.id));
  }

  function toggleOne(wordId: number) {
    setSelectedIds((current) =>
      current.includes(wordId) ? current.filter((id) => id !== wordId) : [...current, wordId],
    );
  }

  function handleBulkDelete() {
    if (!selectedIds.length) {
      return;
    }
    if (!window.confirm(`¿Eliminar ${selectedIds.length} palabra(s)?`)) {
      return;
    }

    startTransition(async () => {
      await bulkDeleteWordsAction(selectedIds);
    });
  }

  function handleDelete(wordId: number, wordText: string) {
    if (!window.confirm(`¿Eliminar "${wordText}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    startTransition(async () => {
      await deleteWordAction(wordId);
    });
  }

  return (
    <>
      {selectedIds.length > 0 ? (
        <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-medium text-neutral-700">
              {selectedIds.length} palabra{selectedIds.length === 1 ? "" : "s"} seleccionada
              {selectedIds.length === 1 ? "" : "s"}
            </div>
            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isPending}
                onClick={handleBulkDelete}
                type="button"
              >
                <i className="fa-solid fa-trash w-4" />
                <span>{isPending ? "Eliminando..." : "Eliminar"}</span>
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-600 px-4 py-2 font-medium text-white hover:bg-neutral-700"
                onClick={() => setSelectedIds([])}
                type="button"
              >
                <i className="fa-solid fa-times w-4" />
                <span>Limpiar</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-gradient-to-r from-neutral-50 to-primary-50/30">
              <th className="rounded-tl-3xl border-b border-neutral-200/50 px-6 py-5 text-center">
                <input
                  checked={allSelected}
                  className="h-5 w-5 rounded-lg border-2 border-neutral-300 text-primary-600"
                  onChange={toggleAll}
                  type="checkbox"
                />
              </th>
              {["Palabra", "Traducción", "Explicación", "Idioma", "Etiqueta", "Progreso", "Acciones"].map(
                (label, index) => (
                  <th
                    className={`border-b border-neutral-200/50 px-6 py-5 text-left text-sm font-semibold text-neutral-700 ${
                      index === 6 ? "rounded-tr-3xl text-center" : ""
                    }`}
                    key={label}
                  >
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {words.map((word) => (
              <tr className="hover:bg-neutral-50/50" key={word.id}>
                <td className="px-6 py-6 text-center">
                  <input
                    checked={selectedIds.includes(word.id)}
                    className="h-5 w-5 rounded-lg border-2 border-neutral-300 text-primary-600"
                    onChange={() => toggleOne(word.id)}
                    type="checkbox"
                  />
                </td>
                <td className="px-6 py-6 align-top">
                  <div className="text-lg font-semibold text-neutral-900">{word.englishWord}</div>
                  <div className="text-xs text-neutral-500">{word.language}</div>
                </td>
                <td className="px-6 py-6 align-top text-neutral-800">{word.translation}</td>
                <td className="px-6 py-6 align-top">
                  {word.explanation ? (
                    <div className="max-w-xs text-sm leading-relaxed text-neutral-700">
                      {word.explanation.length > 60
                        ? `${word.explanation.slice(0, 60)}...`
                        : word.explanation}
                    </div>
                  ) : (
                    <span className="text-sm italic text-neutral-400">Sin explicación</span>
                  )}
                </td>
                <td className="px-6 py-6 align-top">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-primary-200/50 bg-primary-100 px-3 py-2 text-sm font-medium text-primary-700">
                    <i className="fa-solid fa-globe w-3" />
                    <span>{word.language}</span>
                  </div>
                </td>
                <td className="px-6 py-6 align-top">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-secondary-200/50 bg-secondary-100 px-3 py-2 text-sm font-medium text-secondary-700">
                    <i className="fa-solid fa-tag w-3" />
                    <span>{word.tag}</span>
                  </div>
                </td>
                <td className="px-6 py-6 align-top">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-neutral-600">
                      <div className="font-medium">{word.timesPracticed} sesiones</div>
                      {word.timesPracticed > 0 ? (
                        <div className="text-xs text-neutral-500">{word.accuracy}% precisión</div>
                      ) : null}
                    </div>
                    {word.timesPracticed > 0 ? (
                      <div
                        className={`rounded-lg border px-2 py-1 text-xs font-medium ${
                          word.accuracy >= 80
                            ? "border-green-200 bg-green-100 text-green-700"
                            : word.accuracy >= 60
                              ? "border-yellow-200 bg-yellow-100 text-yellow-700"
                              : "border-red-200 bg-red-100 text-red-700"
                        }`}
                      >
                        {word.accuracy}%
                      </div>
                    ) : null}
                  </div>
                  {word.needsPractice ? (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                      <i className="fa-solid fa-triangle-exclamation w-3" />
                      <span>Necesita práctica</span>
                    </div>
                  ) : null}
                </td>
                <td className="px-6 py-6 align-top">
                  <div className="flex flex-col gap-2">
                    <Link
                      className="inline-flex items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-100 px-3 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-200"
                      href={`/edit/${word.id}`}
                    >
                      <i className="fa-solid fa-pen w-4" />
                      <span>Editar</span>
                    </Link>
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                      disabled={isPending}
                      onClick={() => handleDelete(word.id, word.englishWord)}
                      type="button"
                    >
                      <i className="fa-solid fa-trash w-4" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
