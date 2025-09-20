// src/api/client.ts
import axios from "axios";

const API_BASE = (import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:4000") + "/v1";

export const client = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // ver punto 2
});

export default client; // por si en algún archivo lo importaste como default
