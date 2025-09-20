// src/api/client.ts
import axios from "axios";

// Base con /v1 para NO repetirlo en cada llamada
const API_BASE =
  (import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:4000") + "/v1";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // no usamos cookies/session
});

export default api;
