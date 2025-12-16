import axios from "axios";

const api = axios.create({
  baseURL: "https://prep-pilot-h3m8.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// attach token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
