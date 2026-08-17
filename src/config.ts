export interface Config {
  port: number;
}

/**
 * Resolve runtime configuration from the environment. Kept in one place so the
 * rest of the app never reaches into `process.env` directly.
 */
export function loadConfig(
  env: Record<string, string | undefined> = process.env
): Config {
  return {
    port: Number(env.PORT ?? 3000),
  };
}
