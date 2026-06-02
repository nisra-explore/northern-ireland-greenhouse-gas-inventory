export function getNested(obj, path) {
  return path.reduce((acc, key) => acc?.[key], obj);
}