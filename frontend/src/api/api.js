import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/api/users";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 🔥 REQUIRED for cookie auth
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
