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

