import assert from "node:assert/strict";
import { test } from "node:test";

import { buildBoard } from "../src/board.ts";
import { IssueStore } from "../src/store.ts";

test("buildBoard returns one column per status in order", () => {
  const store = new IssueStore();
  store.create({ title: "Later", status: "backlog" });
  store.create({ title: "Now", status: "in_progress" });
  store.create({ title: "Ship", status: "done" });

  const board = buildBoard(store);
  assert.deepEqual(
    board.map((c) => c.status),
    ["backlog", "in_progress", "review", "done"]
  );
  assert.equal(board[0].issues[0].title, "Later");
  assert.equal(board[1].issues[0].title, "Now");
  assert.equal(board[2].issues.length, 0);
  assert.equal(board[3].issues[0].title, "Ship");
});
