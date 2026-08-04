import assert from "node:assert/strict";
import { test } from "node:test";

import { generateSlug, isValidSlug } from "../src/slug.ts";

test("generateSlug produces valid slugs", () => {
  for (let i = 0; i < 100; i++) {
    const slug = generateSlug();
    assert.equal(slug.length, 7);
    assert.ok(isValidSlug(slug), `expected valid slug, got ${slug}`);
  }
});

test("isValidSlug rejects bad input", () => {
  assert.equal(isValidSlug(""), false);
  assert.equal(isValidSlug("ab"), false);
  assert.equal(isValidSlug("has spaces"), false);
  assert.equal(isValidSlug("UPPER"), false);
  assert.equal(isValidSlug("a".repeat(33)), false);
});

test("isValidSlug accepts custom slugs", () => {
  assert.equal(isValidSlug("launch-2026"), true);
  assert.equal(isValidSlug("docs"), true);
});
