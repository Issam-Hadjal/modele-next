import { readdirSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import { describe, expect, it } from "vitest";

// The rule of feature folders: what belongs to one feature lives in its folder,
// lib/<feature>/, with its tests; what is shared stays flat in lib/. A feature
// folder is imported only by its own feature: by lib/<feature>/ itself, and by any
// route folder named <feature> under app/ (app/<feature>/, app/tools/<feature>/).
// What two features need moves up, flat, into lib/. This test fails the CI otherwise.

// npm test runs Vitest from the repository root.
const ROOT = process.cwd();
const SCANNED = ["app", "components", "lib"];
const SELF = "lib/architecture.test.ts";
const SOURCE = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/;
const IMPORT =
  /(?:import|export)\s[^'"]*?from\s*["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|import\s+["']([^"']+)["']|require\s*\(\s*["']([^"']+)["']\s*\)/g;

type Violation = { importer: string; target: string; feature: string };

function walk(dir: string, out: Map<string, string>) {
  let entries;
  try {
    entries = readdirSync(join(ROOT, dir), { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = posix.join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    // This file quotes imports in its own examples: it is not scanned.
    else if (SOURCE.test(entry.name) && path !== SELF) out.set(path, readFileSync(join(ROOT, path), "utf8"));
  }
}

function specifiers(source: string): string[] {
  return [...source.matchAll(IMPORT)].map((m) => m[1] ?? m[2] ?? m[3] ?? m[4]);
}

// Repository path of an import, or null for a package.
function target(importer: string, spec: string, files: Map<string, string>): string | null {
  let path: string;
  if (spec.startsWith("@/")) path = posix.normalize(spec.slice(2));
  else if (spec.startsWith(".")) path = posix.normalize(posix.join(posix.dirname(importer), spec));
  else return null;
  // "@/lib/x" names the folder lib/x/ when one exists: its index file.
  if ([...files.keys()].some((f) => f.startsWith(path + "/"))) path = path + "/index";
  return path;
}

function featureOf(path: string): string | null {
  const parts = path.split("/");
  return parts[0] === "lib" && parts.length >= 3 ? parts[1] : null;
}

function belongsTo(importer: string, feature: string): boolean {
  if (importer.startsWith(`lib/${feature}/`)) return true;
  const folders = importer.split("/").slice(0, -1);
  return folders[0] === "app" && folders.includes(feature);
}

function violations(files: Map<string, string>): Violation[] {
  const found: Violation[] = [];
  for (const [importer, source] of files) {
    for (const spec of specifiers(source)) {
      const path = target(importer, spec, files);
      const feature = path && featureOf(path);
      if (feature && !belongsTo(importer, feature)) found.push({ importer, target: spec, feature });
    }
  }
  return found;
}

function describeAll(found: Violation[]): string {
  return found
    .map(
      (v) =>
        `${v.importer} imports ${v.target}, which belongs to the feature "${v.feature}": ` +
        `only lib/${v.feature}/ and app/**/${v.feature}/ may import it; move what both need, flat, into lib/.`,
    )
    .join("\n");
}

describe("feature folders", () => {
  it("are imported only by their own feature, in this repository", () => {
    const files = new Map<string, string>();
    for (const dir of SCANNED) walk(dir, files);
    const found = violations(files);
    expect(found, describeAll(found)).toEqual([]);
  });

  const files = (entries: Record<string, string>) => new Map(Object.entries(entries));

  it("lets a feature import itself and lets its routes import it", () => {
    const found = violations(
      files({
        "lib/timestamp/convert.ts": 'import { pad } from "./pad";',
        "lib/timestamp/pad.ts": "export const pad = 1;",
        "app/timestamp/page.tsx": 'import { convert } from "@/lib/timestamp/convert";',
        "app/tools/timestamp/page.tsx": 'import { convert } from "../../../lib/timestamp/convert";',
      }),
    );
    expect(found).toEqual([]);
  });

  it("refuses a route or a feature that imports another feature", () => {
    const found = violations(
      files({
        "lib/timestamp/convert.ts": "export const convert = 1;",
        "lib/json/format.ts": 'import { convert } from "@/lib/timestamp/convert";',
        "app/json/page.tsx": 'import { convert } from "@/lib/timestamp/convert";',
      }),
    );
    expect(found.map((v) => v.importer).sort()).toEqual(["app/json/page.tsx", "lib/json/format.ts"]);
  });

  it("refuses shared code that depends on a feature", () => {
    const found = violations(
      files({
        "lib/timestamp/index.ts": "export const convert = 1;",
        "lib/dates.ts": 'export { convert } from "@/lib/timestamp";',
        "components/clock.tsx": 'const m = await import("../lib/timestamp/index");',
      }),
    );
    expect(found.map((v) => v.importer).sort()).toEqual(["components/clock.tsx", "lib/dates.ts"]);
  });

  it("ignores packages and flat shared code", () => {
    const found = violations(
      files({
        "lib/dates.ts": "export const today = 1;",
        "app/json/page.tsx": 'import Link from "next/link";\nimport { today } from "@/lib/dates";',
      }),
    );
    expect(found).toEqual([]);
  });
});
