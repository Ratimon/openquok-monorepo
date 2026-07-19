import fs from "node:fs";

export type PlugFieldInput = { name: string; value: string };

export type PlugUpsertInput = {
  func: string;
  fields: PlugFieldInput[];
  plugId?: string;
};

export function parsePlugFieldsJson(input: unknown): PlugFieldInput[] {
  const parsed = input;
  if (!Array.isArray(parsed)) {
    throw new Error("fields must be a JSON array of { name, value } objects");
  }
  return parsed.map((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`fields[${index}] must be an object with name and value`);
    }
    const name = (entry as { name?: unknown }).name;
    const value = (entry as { value?: unknown }).value;
    if (typeof name !== "string" || !name.trim()) {
      throw new Error(`fields[${index}].name must be a non-empty string`);
    }
    if (typeof value !== "string") {
      throw new Error(`fields[${index}].value must be a string`);
    }
    return { name: name.trim(), value };
  });
}

export function readPlugUpsertFromJsonFile(filePath: string): PlugUpsertInput {
  const raw = fs.readFileSync(filePath, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`--json file must contain valid JSON: ${filePath}`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("--json file must be a JSON object with func and fields");
  }
  const obj = parsed as { func?: unknown; fields?: unknown; plugId?: unknown };
  if (typeof obj.func !== "string" || !obj.func.trim()) {
    throw new Error("--json file must include a non-empty func string (plug methodName from plugs:catalog)");
  }
  const fields = parsePlugFieldsJson(obj.fields);
  const plugId =
    typeof obj.plugId === "string" && obj.plugId.trim() ? obj.plugId.trim() : undefined;
  return { func: obj.func.trim(), fields, plugId };
}

export function buildPlugUpsertInput(args: {
  func?: unknown;
  fields?: unknown;
  plugId?: unknown;
  json?: unknown;
}): PlugUpsertInput {
  if (typeof args.json === "string" && args.json.trim()) {
    return readPlugUpsertFromJsonFile(args.json.trim());
  }
  if (typeof args.func !== "string" || !args.func.trim()) {
    throw new Error("func is required (plug methodName from plugs:catalog) unless --json is provided");
  }
  const fields = parsePlugFieldsJson(
    typeof args.fields === "string" ? JSON.parse(args.fields) : args.fields
  );
  const plugId =
    typeof args.plugId === "string" && args.plugId.trim() ? args.plugId.trim() : undefined;
  return { func: args.func.trim(), fields, plugId };
}

export function parseActivatedFlag(input: unknown): boolean {
  if (input === true || input === "true" || input === 1 || input === "1") return true;
  if (input === false || input === "false" || input === 0 || input === "0") return false;
  throw new Error("activated must be true or false");
}
