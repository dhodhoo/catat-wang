export function extractRelationName(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0]?.name === "string" ? value[0].name : null;
  }

  if (value && typeof value === "object" && "name" in value && typeof value.name === "string") {
    return value.name;
  }

  return null;
}
