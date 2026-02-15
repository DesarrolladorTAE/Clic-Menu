// src/services/auth.service.js
import api from "../api";

/**
 * Registro
 */
export async function requestRegisterCode(payload) {
  const { data } = await api.post("/register/request-code", payload);
  return data;
}

export async function verifyRegisterCode(payload) {
  const { data } = await api.post("/register/verify-code", payload);
  return data;
}

export async function resendRegisterCode(payload) {
  const { data } = await api.post("/register/resend-code", payload);
  return data;
}

/**
 * Login / sesión
 */
export async function login(payload) {
  // payload = { email, password }
  const { data } = await api.post("/login", payload);
  // Solo guardamos token si vino (cuando términos ya están aceptados)
  if (data?.token) localStorage.setItem("auth_token", data.token);
  return data; // { message, user, token }
}

/**
 * Aceptar términos SIN sesión (user_id/email)
 */
export async function acceptTerms(payload) {
  // payload: { accepted: true, user_id, email }
  const { data } = await api.post("/terms/accept", payload);
  return data; // { ok, message }
}

export async function me() {
  const token = localStorage.getItem("auth_token");
  if (!token) return { user: null };

  const { data } = await api.get("/me");
  return data;
}

export async function logout() {
  const { data } = await api.post("/logout");
  localStorage.removeItem("auth_token");
  return data;
}

/**
 * Olvidar contraseña
 */
export async function requestPasswordResetCode(payload) {
  const { data } = await api.post("/password/request-code", payload);
  return data;
}

export async function resetPassword(payload) {
  const { data } = await api.post("/password/reset", payload);
  return data;
}
