export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export const toJsonValue = (
  value: Record<string, unknown> | null | undefined,
): JsonValue | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return JSON.parse(JSON.stringify(value)) as JsonObject;
};

export const jsonValueToRecord = (
  value: JsonValue | null,
): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};
