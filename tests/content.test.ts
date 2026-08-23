import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "src/content/case-studies";

function readFrontmatter(file: string): Record<string, string> {
  const raw = readFileSync(join(DIR, file), "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error(`${file} has no frontmatter block`);
  const fields: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([\w-]+):\s*(.+)$/);
    if (kv) fields[kv[1]] = kv[2].trim();
  }
  return fields;
}

describe("case study frontmatter", () => {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".mdx"));

  it("has at least two case studies", () => {
    expect(files.length).toBeGreaterThanOrEqual(2);
  });

  it.each(files)("%s has a valid schema", (file) => {
    const fields = readFrontmatter(file);

    for (const key of ["title", "role", "period", "summary"]) {
      expect(fields[key], `${key} missing`).toBeDefined();
      expect(fields[key].replace(/^"|"$/g, "").length).toBeGreaterThan(0);
    }

    expect(fields.stack, "stack missing").toBeDefined();
    expect(fields.stack.startsWith("["), "stack must be an array").toBe(true);
    expect(fields.stack.replace(/[[\]"\s]/g, "").split(",").filter(Boolean).length).toBeGreaterThan(0);

    expect(fields.order, "order missing").toBeDefined();
    expect(Number.isInteger(Number(fields.order)), "order must be an integer").toBe(true);
  });

  it("gives every case study a unique order", () => {
    const orders = files.map((f) => Number(readFrontmatter(f).order));
    expect(new Set(orders).size).toBe(orders.length);
  });
});
