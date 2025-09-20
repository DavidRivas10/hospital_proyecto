// src/utils/id.ts
export function newPatientId(prefix = "H-") {
  // Genera un ID corto legible: p-xxxxxxxx (a-z0-9)
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const body = Array.from(bytes, b => alphabet[b % alphabet.length]).join("");
  return prefix + body;
}
