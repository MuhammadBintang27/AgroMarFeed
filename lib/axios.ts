// lib/axios.ts
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true, // penting untuk session cookie
  headers: {
    "ngrok-skip-browser-warning": "true"
  }
});

export default instance;