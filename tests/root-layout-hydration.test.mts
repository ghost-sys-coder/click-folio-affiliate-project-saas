import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("root layout suppresses intentional hydration differences on html and body", async () => {
  const source = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.match(source, /<html[\s\S]*suppressHydrationWarning/);
  assert.match(source, /<body[\s\S]*suppressHydrationWarning/);
});
