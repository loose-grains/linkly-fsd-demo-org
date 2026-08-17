export const STATUSES = ["backlog", "in_progress", "review", "done"] as const;

export type Status = (typeof STATUSES)[number];

export interface Issue {
  id: number;
  title: string;
  body: string;
  status: Status;
  assignee: string | null;
  createdAt: number;
  updatedAt: number;
}

export function isStatus(value: string): value is Status {
  return (STATUSES as readonly string[]).includes(value);
}
