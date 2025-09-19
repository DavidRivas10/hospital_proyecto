import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE,
});

// Sin tokens por tu indicación
api.interceptors.request.use((config) => config);

export default api;
