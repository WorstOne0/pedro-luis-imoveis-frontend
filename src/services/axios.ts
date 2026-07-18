import axios from "axios";

// Set NEXT_PUBLIC_API_URL per environment; the localhost fallback only covers
// local development.
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
