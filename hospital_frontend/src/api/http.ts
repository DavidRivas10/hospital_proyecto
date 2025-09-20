// src/api/http.ts
import axios from "axios";

export const API_URL  = import.meta.env.VITE_API_URL as string;        // ej: http://localhost:4000
export const API_BASE = (import.meta.env.VITE_API_BASE as string) || ""; // ej: /v1

// Concatena cuidando las barras para evitar /v1/v1
export const apiPath = (path = "") =>
  `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

const api = axios.create({
  baseURL: API_URL,   // SIN /v1 aquí
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("auth");
  if (raw) {
    const { accessToken } = JSON.parse(raw);
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;
// (opcional) por compatibilidad con código existente que importe { client }
export const client = api;
