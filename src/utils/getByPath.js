export function getByPath(obj, path, fallback = undefined) {
  if (!obj || !path) return fallback;
  const parts = String(path).split(".");
  let cur = obj;
  for (const p of parts) {
    cur = cur?.[p];
    if (cur === undefined) return fallback;
  }
  return cur ?? fallback;
}
