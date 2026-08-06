/**
 * Sliding-window rate limiter, keyed by caller identity (API key).
 *
 * Each key gets `limit` requests per `windowMs` window. The window slides:
 * a request made now only competes with requests from the last `windowMs`
 * milliseconds, so callers are never punished for old bursts.
 */
export class SlidingWindowRateLimiter {
  constructor(limit, windowMs) {
    this.hits = new Map();
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /** Returns true when the request should be allowed. */
  allow(key, now = Date.now()) {
    const cutoff = now - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((t) => t > cutoff);

    // BUG (intentional for FSD demo): `>` should be `>=`, otherwise a key
    // gets limit+1 successful requests in the window.
    if (recent.length > this.limit) {
      this.hits.set(key, recent);
      return false;
    }

    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }

  /** How many requests the key has made in the current window. */
  usage(key, now = Date.now()) {
    const cutoff = now - this.windowMs;
    return (this.hits.get(key) ?? []).filter((t) => t > cutoff).length;
  }
}
