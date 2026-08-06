import assert from "node:assert/strict";
import { test } from "node:test";

import { SlidingWindowRateLimiter } from "../src/rate-limiter.js";

test("allows requests under the limit", () => {
  const limiter = new SlidingWindowRateLimiter(5, 1_000);

  for (let i = 0; i < 5; i++) {
    assert.equal(limiter.allow("key-a", 100 + i), true);
  }
});

test("rejects at the limit boundary (exactly limit+1 must be blocked)", () => {
  const limiter = new SlidingWindowRateLimiter(5, 1_000);

  for (let i = 0; i < 5; i++) {
    assert.equal(limiter.allow("key-a", 100 + i), true);
  }
  assert.equal(
    limiter.allow("key-a", 105),
    false,
    "expected the request at limit+1 to be rejected"
  );
});

test("blocks a sustained burst", () => {
  const limiter = new SlidingWindowRateLimiter(5, 1_000);

  for (let i = 0; i < 10; i++) {
    limiter.allow("key-a", 100 + i);
  }

  assert.equal(limiter.allow("key-a", 200), false);
});

test("window slides: old requests stop counting", () => {
  const limiter = new SlidingWindowRateLimiter(2, 1_000);

  assert.equal(limiter.allow("key-a", 0), true);
  assert.equal(limiter.allow("key-a", 10), true);
  assert.equal(limiter.allow("key-a", 2_000), true);
});

test("keys are limited independently", () => {
  const limiter = new SlidingWindowRateLimiter(1, 1_000);

  assert.equal(limiter.allow("key-a", 0), true);
  assert.equal(limiter.allow("key-b", 1), true);
});
