import { describe, it, expect } from "vitest";
import { chapters } from "../src/data/timeline";

describe("story timeline", () => {
  it("has five chapters", () => {
    expect(chapters).toHaveLength(5);
  });

  it("is in chronological order", () => {
    const years = chapters.map((c) => c.sortYear);
    expect(years).toEqual([...years].sort((a, b) => a - b));
  });

  it("gives every chapter a unique id", () => {
    const ids = chapters.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("leaves no field empty", () => {
    for (const chapter of chapters) {
      expect(chapter.id.length).toBeGreaterThan(0);
      expect(chapter.period.length).toBeGreaterThan(0);
      expect(chapter.title.length).toBeGreaterThan(0);
      expect(chapter.body.length).toBeGreaterThan(0);
    }
  });
});
