import { describe, expect, it, vi } from "vitest";

import { advanceSessionTx, deriveMixedDirection, shuffle } from "@/lib/quiz";

describe("shuffle", () => {
  it("preserva los elementos sin mutar el original", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect([...result].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it("acepta array vacío", () => {
    expect(shuffle([])).toEqual([]);
  });

  it("acepta un único elemento", () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

describe("deriveMixedDirection", () => {
  it("es determinista por (sessionId, index)", () => {
    expect(deriveMixedDirection("session-1", 0)).toBe(deriveMixedDirection("session-1", 0));
  });

  it("solo devuelve valores válidos", () => {
    for (let i = 0; i < 50; i++) {
      const value = deriveMixedDirection("any-session", i);
      expect(["to_spanish", "to_original"]).toContain(value);
    }
  });

  it("varía con el índice para una misma sesión", () => {
    const values = new Set<number>();
    for (let i = 0; i < 20; i++) {
      const dir = deriveMixedDirection("session-x", i);
      values.add(dir === "to_spanish" ? 0 : 1);
      if (values.size === 2) break;
    }
    expect(values.size).toBe(2);
  });
});

describe("advanceSessionTx compare-and-swap", () => {
  function buildTx(count: number) {
    const updateMany = vi.fn().mockResolvedValue({ count });
    return {
      tx: { quizSession: { updateMany } } as unknown as Parameters<
        typeof advanceSessionTx
      >[0],
      updateMany,
    };
  }

  it("avanza cuando updateMany afecta 1 fila (CAS exitoso)", async () => {
    const { tx, updateMany } = buildTx(1);

    await advanceSessionTx(tx, 42, 3, 10, true, true);

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 42, currentIndex: 3 },
      data: {
        currentIndex: { increment: 1 },
        totalQuestions: { increment: 1 },
        correctAnswers: { increment: 1 },
        isCompleted: false,
      },
    });
  });

  it("marca isCompleted cuando el avance llega al final del pool", async () => {
    const { tx, updateMany } = buildTx(1);

    await advanceSessionTx(tx, 42, 9, 10, false, true);

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 42, currentIndex: 9 },
      data: {
        currentIndex: { increment: 1 },
        totalQuestions: { increment: 1 },
        correctAnswers: undefined,
        isCompleted: true,
      },
    });
  });

  it("lanza quiz_question_invalid cuando el CAS no avanza (count=0)", async () => {
    const { tx } = buildTx(0);

    await expect(
      advanceSessionTx(tx, 42, 3, 10, true, true),
    ).rejects.toThrow("quiz_question_invalid");
  });
});
