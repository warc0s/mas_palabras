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

type WordsTableCopy = {
  clear: string;
  delete: string;
  deleting: string;
  editAction: string;
  deleteAction: string;
  confirmBulkDeleteStart: string;
  confirmBulkDeleteEnd: string;
  confirmSingleDeleteStart: string;
  confirmSingleDeleteEnd: string;
  noNote: string;
  new: string;
  review: string;
  selectAll: string;
  selectAction: string;
  selectedSingular: string;
  selectedPlural: string;
  table: readonly string[];
};

export function WordsTable({ words, copy }: { words: WordRow[]; copy: WordsTableCopy }) {
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
    // TODO: replace window.confirm with an accessible <ConfirmDialog> component
    if (!window.confirm(`${copy.confirmBulkDeleteStart}${selectedIds.length}${copy.confirmBulkDeleteEnd}`)) {
      return;
    }

    startTransition(async () => {
      await bulkDeleteWordsAction(selectedIds);
    });
  }

  function handleDelete(wordId: number, wordText: string) {
    // TODO: replace window.confirm with an accessible <ConfirmDialog> component
    if (!window.confirm(`${copy.confirmSingleDeleteStart}${wordText}${copy.confirmSingleDeleteEnd}`)) {
      return;
    }

    startTransition(async () => {
      await deleteWordAction(wordId);
    });
  }

  return (
    <>
      {selectedIds.length > 0 ? (
        <div className="flex flex-col gap-3 border-b border-primary-200 bg-primary-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-mono text-sm uppercase tracking-wide text-primary-800">
            {selectedIds.length} {selectedIds.length === 1 ? copy.selectedSingular : copy.selectedPlural}
          </div>
          <div className="flex gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-4 py-2 text-sm font-medium text-neutral-25 shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isPending}
              onClick={handleBulkDelete}
              type="button"
            >
              <i className="fa-solid fa-trash" />
              <span>{isPending ? copy.deleting : copy.delete}</span>
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-neutral-25 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
              onClick={() => setSelectedIds([])}
              type="button"
            >
              <i className="fa-solid fa-xmark" />
              <span>{copy.clear}</span>
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-neutral-300 bg-neutral-50">
              <th className="w-12 px-6 py-4 text-center">
                <input
                  aria-label={copy.selectAll}
                  checked={allSelected}
                  className="h-4 w-4 rounded-sm border-neutral-400 text-primary-600 accent-primary-600"
                  onChange={toggleAll}
                  type="checkbox"
                />
              </th>
              {copy.table.map(
                (label, index) => (
                  <th
                    className={`px-6 py-4 font-mono text-[0.7rem] font-medium uppercase tracking-widest text-neutral-500 ${
                      index === 6 ? "text-right" : ""
                    }`}
                    key={label || "actions"}
                  >
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {words.map((word, index) => (
              <tr
                className="group border-b border-neutral-200 last:border-b-0 hover:bg-primary-50/40"
                key={word.id}
              >
                <td className="px-6 py-5 text-center align-top">
                  <input
                    aria-label={`${copy.selectAction} ${word.englishWord}`}
                    checked={selectedIds.includes(word.id)}
                    className="h-4 w-4 rounded-sm border-neutral-400 text-primary-600 accent-primary-600"
                    onChange={() => toggleOne(word.id)}
                    type="checkbox"
                  />
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[0.7rem] text-neutral-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-lg font-semibold text-neutral-900">
                      {word.englishWord}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 align-top">
                  <span className="font-display text-base italic text-neutral-700">
                    {word.translation}
                  </span>
                </td>
                <td className="px-6 py-5 align-top">
                  {word.explanation ? (
                    <p className="max-w-xs text-sm leading-relaxed text-neutral-600">
                      {word.explanation.length > 60
                        ? `${word.explanation.slice(0, 60)}…`
                        : word.explanation}
                    </p>
                  ) : (
                    <span className="font-mono text-xs uppercase tracking-wide text-neutral-300">
                      {copy.noNote}
                    </span>
                  )}
                </td>
                <td className="px-6 py-5 align-top">
                  <span className="meta-chip border-secondary-200 bg-secondary-50 text-secondary-700">
                    <i className="fa-solid fa-earth-americas" />
                    {word.language}
                  </span>
                </td>
                <td className="px-6 py-5 align-top">
                  <span className="meta-chip border-neutral-300 bg-neutral-50 text-neutral-600">
                    <i className="fa-solid fa-tag" />
                    {word.tag}
                  </span>
                </td>
                <td className="px-6 py-5 align-top">
                  {word.timesPracticed > 0 ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-7 min-w-[3rem] items-center justify-center rounded-full px-2.5 font-mono text-xs font-semibold ${
                          word.accuracy >= 80
                            ? "bg-secondary-100 text-secondary-800"
                            : word.accuracy >= 60
                              ? "bg-accent/15 text-[#8a6418]"
                              : "bg-primary-100 text-primary-800"
                        }`}
                      >
                        {word.accuracy}%
                      </span>
                      <span className="font-mono text-[0.7rem] text-neutral-400">
                        ×{word.timesPracticed}
                      </span>
                    </div>
                  ) : (
                    <span className="font-mono text-xs uppercase tracking-wide text-neutral-300">
                      {copy.new}
                    </span>
                  )}
                  {word.needsPractice ? (
                    <div className="mt-2 inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-wide text-primary-600">
                      <i className="fa-solid fa-circle-exclamation" />
                      {copy.review}
                    </div>
                  ) : null}
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                    <Link
                      aria-label={`${copy.editAction} ${word.englishWord}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-300 text-neutral-600 transition-all hover:-translate-y-0.5 hover:border-secondary-400 hover:bg-secondary-50 hover:text-secondary-700"
                      href={`/edit/${word.id}`}
                    >
                      <i className="fa-solid fa-pen text-sm" />
                    </Link>
                    <button
                      aria-label={`${copy.deleteAction} ${word.englishWord}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-300 text-neutral-600 transition-all hover:-translate-y-0.5 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isPending}
                      onClick={() => handleDelete(word.id, word.englishWord)}
                      type="button"
                    >
                      <i className="fa-solid fa-trash text-sm" />
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
