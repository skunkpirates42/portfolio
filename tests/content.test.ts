import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "src/content/case-studies";
const REQUIRED = ["title", "role", "period", "summary", "stack", "order"];

describe("case study frontmatter", () => {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".mdx"));

  it("has at least two case studies", () => {
    expect(files.length).toBeGreaterThanOrEqual(2);
  });

  it.each(files)("%s declares every required field", (file) => {
    const raw = readFileSync(join(DIR, file), "utf8");
    const match = raw.match(/^---\n([\s\S]*?)\n---/);
    expect(match).not.toBeNull();
    const frontmatter = match![1];
    for (const key of REQUIRED) {
      expect(frontmatter).toContain(`${key}:`);
    }
  });
});
