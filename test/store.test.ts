import assert from "node:assert/strict";
import { test } from "node:test";

import { IssueStore } from "../src/store.ts";

test("create assigns incremental ids and defaults", () => {
  const store = new IssueStore();
  const first = store.create({ title: "One" }, 100);
  const second = store.create({ title: "Two", body: "hi" }, 200);
  assert.equal(first.id, 1);
  assert.equal(second.id, 2);
  assert.equal(first.status, "backlog");
  assert.equal(first.assignee, null);
  assert.equal(second.body, "hi");
  assert.equal(second.createdAt, 200);
});

test("update patches fields and bumps updatedAt", () => {
  const store = new IssueStore();
  store.create({ title: "Draft" }, 1);
  const updated = store.update(
    1,
    { title: "Ready", status: "in_progress", assignee: "natalie" },
    50
  );
  assert.equal(updated.title, "Ready");
  assert.equal(updated.status, "in_progress");
  assert.equal(updated.assignee, "natalie");
  assert.equal(updated.updatedAt, 50);
});

test("update throws for unknown ids", () => {
  const store = new IssueStore();
  assert.throws(() => store.update(99, { title: "nope" }), /unknown issue/);
});

test("byStatus and countByStatus filter correctly", () => {
  const store = new IssueStore();
  store.create({ title: "A", status: "backlog" });
  store.create({ title: "B", status: "in_progress" });
  store.create({ title: "C", status: "in_progress" });
  assert.equal(store.countByStatus("in_progress"), 2);
  assert.deepEqual(
    store.byStatus("backlog").map((i) => i.title),
    ["A"]
  );
});
