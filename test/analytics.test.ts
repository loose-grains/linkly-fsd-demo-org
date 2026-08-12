import assert from "node:assert/strict";
import { test } from "node:test";

import { ClickTracker } from "../src/analytics.ts";

test("statsFor is zeroed for an unseen slug", () => {
  const tracker = new ClickTracker();
  assert.deepEqual(tracker.statsFor("nope"), {
    totalClicks: 0,
    lastClickedAt: null,
  });
});

test("recordClick increments the counter", () => {
  const tracker = new ClickTracker();
  tracker.recordClick("go", 1_000);
  tracker.recordClick("go", 2_000);
  assert.equal(tracker.statsFor("go").totalClicks, 2);
});

test("recordClick tracks the last click timestamp", () => {
  const tracker = new ClickTracker();
  tracker.recordClick("go", 1_000);
  tracker.recordClick("go", 5_000);
  assert.equal(tracker.statsFor("go").lastClickedAt, 5_000);
});

test("clicks are tracked per slug", () => {
  const tracker = new ClickTracker();
  tracker.recordClick("a", 1);
  tracker.recordClick("b", 2);
  tracker.recordClick("a", 3);
  assert.equal(tracker.statsFor("a").totalClicks, 2);
  assert.equal(tracker.statsFor("b").totalClicks, 1);
});
