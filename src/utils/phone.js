// src/utils/phone.js
export function normalizePhone(phone) {
  const digits = String(phone ?? "").replace(/\D+/g, "");
  return digits.slice(-10);
}
