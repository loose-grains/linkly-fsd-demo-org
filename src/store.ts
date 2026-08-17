import type { Issue, Status } from "./issue.ts";

export interface CreateIssueInput {
  title: string;
  body?: string;
  status?: Status;
  assignee?: string | null;
}

export interface UpdateIssueInput {
  title?: string;
  body?: string;
  status?: Status;
  assignee?: string | null;
}

/**
 * In-memory issue storage. A real deployment would back this with a database;
 * for the demo the process lifetime is plenty.
 */
export class IssueStore {
  private readonly issues = new Map<number, Issue>();
  private nextId = 1;

  create(input: CreateIssueInput, now = Date.now()): Issue {
    const issue: Issue = {
      id: this.nextId++,
      title: input.title,
      body: input.body ?? "",
      status: input.status ?? "backlog",
      assignee: input.assignee ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.issues.set(issue.id, issue);
    return issue;
  }

  get(id: number): Issue | undefined {
    return this.issues.get(id);
  }

  update(id: number, patch: UpdateIssueInput, now = Date.now()): Issue {
    const current = this.issues.get(id);
    if (current === undefined) {
      throw new Error(`unknown issue: ${id}`);
    }
    const next: Issue = {
      ...current,
      title: patch.title ?? current.title,
      body: patch.body ?? current.body,
      status: patch.status ?? current.status,
      assignee:
        patch.assignee !== undefined ? patch.assignee : current.assignee,
      updatedAt: now,
    };
    this.issues.set(id, next);
    return next;
  }

  all(): Issue[] {
    return [...this.issues.values()].sort((a, b) => a.id - b.id);
  }

  byStatus(status: Status): Issue[] {
    return this.all().filter((issue) => issue.status === status);
  }

  count(): number {
    return this.issues.size;
  }

  countByStatus(status: Status): number {
    return this.byStatus(status).length;
  }
}
