import { STATUSES, type Issue, type Status } from "./issue.ts";
import type { IssueStore } from "./store.ts";

export interface BoardColumn {
  status: Status;
  label: string;
  issues: Issue[];
}

const LABELS: Record<Status, string> = {
  backlog: "Backlog",
  in_progress: "In progress",
  review: "In review",
  done: "Done",
};

/** Shape the store into a kanban board for the UI / board API. */
export function buildBoard(store: IssueStore): BoardColumn[] {
  return STATUSES.map((status) => ({
    status,
    label: LABELS[status],
    issues: store.byStatus(status),
  }));
}
