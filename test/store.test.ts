import assert from "node:assert/strict";
import { test } from "node:test";

import { LinkStore } from "../src/store.ts";

function link(slug: string) {
  return { slug, targetUrl: `https://example.com/${slug}`, createdAt: 0 };
}

test("create then get roundtrips a link", () => {
  const store = new LinkStore();
  store.create(link("docs"));
  assert.deepEqual(store.get("docs"), link("docs"));
});

test("get returns undefined for unknown slugs", () => {
  const store = new LinkStore();
  assert.equal(store.get("missing"), undefined);
});

test("create rejects duplicate slugs", () => {
  const store = new LinkStore();
  store.create(link("dup"));
  assert.throws(() => store.create(link("dup")), /already exists/);
});

test("all returns every stored link", () => {
  const store = new LinkStore();
  store.create(link("a"));
  store.create(link("b"));
  assert.deepEqual(
    store.all().map((l) => l.slug).sort(),
    ["a", "b"]
  );
});

test("count reflects the number of inserts", () => {
  const store = new LinkStore();
  assert.equal(store.count(), 0);
  store.create(link("one"));
  store.create(link("two"));
  assert.equal(store.count(), 2);
});
