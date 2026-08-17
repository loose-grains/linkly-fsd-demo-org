import assert from "node:assert/strict";
import { test } from "node:test";

import { isStatus } from "../src/issue.ts";

test("isStatus accepts known columns", () => {
  assert.equal(isStatus("backlog"), true);
  assert.equal(isStatus("in_progress"), true);
  assert.equal(isStatus("review"), true);
  assert.equal(isStatus("done"), true);
});

test("isStatus rejects unknown values", () => {
  assert.equal(isStatus("todo"), false);
  assert.equal(isStatus(""), false);
  assert.equal(isStatus("DONE"), false);
});
