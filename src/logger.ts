type LogLevel = "info" | "warn" | "error";

function emit(
  level: LogLevel,
  message: string,
  fields: Record<string, unknown> = {}
): void {
  const line = JSON.stringify({
    level,
    message,
    ...fields,
    ts: new Date().toISOString(),
  });
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

/** Minimal structured logger — one JSON object per line. */
export const logger = {
  info: (message: string, fields?: Record<string, unknown>) =>
    emit("info", message, fields),
  warn: (message: string, fields?: Record<string, unknown>) =>
    emit("warn", message, fields),
  error: (message: string, fields?: Record<string, unknown>) =>
    emit("error", message, fields),
};
