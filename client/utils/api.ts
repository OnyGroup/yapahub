import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";
const WS_BASE_URL = "ws://127.0.0.1:8001";   // WebSocket connections

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(
  (config) => {
    const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { api, WS_BASE_URL };
