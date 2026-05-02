import axios from "axios";

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api`;
  }
  if (window.location.hostname !== "localhost") {
    return `${window.location.origin}/api`;
  }
  return "http://localhost:8000/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
