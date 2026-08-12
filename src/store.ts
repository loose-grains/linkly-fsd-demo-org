export interface Link {
  slug: string;
  targetUrl: string;
  createdAt: number;
}

/**
 * In-memory link storage. A real deployment would back this with a database;
 * for the demo the process lifetime is plenty.
 */
export class LinkStore {
  private readonly links = new Map<string, Link>();

  create(link: Link): void {
    if (this.links.has(link.slug)) {
      throw new Error(`slug already exists: ${link.slug}`);
    }
    this.links.set(link.slug, link);
  }

  get(slug: string): Link | undefined {
    return this.links.get(slug);
  }

  all(): Link[] {
    return [...this.links.values()];
  }

  count(): number {
    return this.links.size;
  }
}
