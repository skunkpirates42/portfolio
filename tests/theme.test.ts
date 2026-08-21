import { describe, it, expect } from "vitest";
import { resolveTheme } from "../src/lib/theme";

describe("resolveTheme", () => {
  it("honors an explicit stored choice over the system preference", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("falls back to the system preference when nothing is stored", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });

  it("ignores a stored value that is not a valid theme", () => {
    expect(resolveTheme("banana", true)).toBe("dark");
    expect(resolveTheme("", false)).toBe("light");
  });
});
