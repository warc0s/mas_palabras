import { describe, expect, it } from "vitest";

import { getAccuracy, needsPractice, practicePriority } from "@/lib/word-metrics";

describe("word metrics", () => {
  it("calcula la precisión con un decimal", () => {
    expect(getAccuracy(5, 4)).toBe(80);
    expect(getAccuracy(3, 2)).toBe(66.7);
  });

  it("marca palabras sin práctica o con poco uso como pendientes", () => {
    expect(needsPractice(0, 0)).toBe(true);
    expect(needsPractice(2, 2)).toBe(true);
    expect(needsPractice(10, 6)).toBe(true);
    expect(needsPractice(10, 8)).toBe(false);
  });

  it("prioriza nuevas sobre poco practicadas y estas sobre baja precisión", () => {
    expect(practicePriority(0, 0)).toBe(3);
    expect(practicePriority(2, 2)).toBe(2);
    expect(practicePriority(10, 6)).toBe(1);
    expect(practicePriority(10, 8)).toBe(0);
  });
});
