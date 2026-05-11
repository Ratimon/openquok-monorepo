export function requireArg(name: string, value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

export function parseJsonMaybe(input: unknown, name: string): unknown | undefined {
  if (input === undefined) return undefined;
  if (typeof input !== "string") throw new Error(`${name} must be a JSON string`);
  try {
    return JSON.parse(input);
  } catch {
    throw new Error(`${name} must be valid JSON`);
  }
}

export function toArrayFromCsv(input: unknown): string[] | undefined {
  if (input === undefined) return undefined;
  if (typeof input !== "string") return undefined;
  const parts = input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : undefined;
}

/**
 * Tags any thrown error with the originating command name so the global error
 * handler (`printErrorJson`) can surface which command failed. Keeps handlers
 * free of per-call try/catch boilerplate while preserving the JSON-first contract.
 */
export async function runCommand<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof Error && typeof (err as any).operation !== "string") {
      (err as any).operation = operation;
    }
    throw err;
  }
}

