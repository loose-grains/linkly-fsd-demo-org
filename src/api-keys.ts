/**
 * API key checks for the private beta.
 *
 * Keys are provisioned out of band and passed in the `x-api-key` header.
 * For now a single shared key is configured via the LINKLY_API_KEY
 * environment variable.
 */
export function expectedApiKey(): string {
  return process.env.LINKLY_API_KEY ?? "dev-key";
}

export function isValidApiKey(candidate: string): boolean {
  return candidate === expectedApiKey();
}
