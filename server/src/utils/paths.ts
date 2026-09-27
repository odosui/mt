import path from "path";

// Resolves `name` as a direct child of `dir`, refusing anything that would
// land elsewhere (`..`, separators, absolute paths).
export function childPath(dir: string, name: string): string {
  const parent = path.resolve(dir);
  const resolved = path.resolve(parent, name);
  if (path.dirname(resolved) !== parent) {
    throw new Error(`Refusing path outside ${parent}: ${name}`);
  }
  return resolved;
}
