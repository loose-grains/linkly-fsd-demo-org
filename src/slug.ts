// Lowercase alphanumerics minus 0/o/1/l lookalikes, so slugs survive being
// read aloud or scribbled on a whiteboard.
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

export function generateSlug(length = 7): string {
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return slug;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]{4,32}$/.test(slug);
}
