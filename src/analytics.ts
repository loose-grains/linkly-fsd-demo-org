export interface ClickStats {
  totalClicks: number;
  lastClickedAt: number | null;
}

/** Per-slug click counters, kept separate from link storage on purpose. */
export class ClickTracker {
  private readonly stats = new Map<string, ClickStats>();

  recordClick(slug: string, now = Date.now()): void {
    const current = this.stats.get(slug) ?? {
      totalClicks: 0,
      lastClickedAt: null,
    };
    this.stats.set(slug, {
      totalClicks: current.totalClicks + 1,
      lastClickedAt: now,
    });
  }

  statsFor(slug: string): ClickStats {
    return this.stats.get(slug) ?? { totalClicks: 0, lastClickedAt: null };
  }
}
