import axios, { AxiosInstance } from "axios";

export const httpClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
