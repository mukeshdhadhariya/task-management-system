import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const API_BASE_URL = rawBaseUrl;
export const API_ORIGIN = rawBaseUrl.replace(/\/api\/?$/, "");

const storageTokenKey = "penscience_token";

export const getStoredToken = () => localStorage.getItem(storageTokenKey);

export const storeToken = (token: string) => {
  localStorage.setItem(storageTokenKey, token);
};

export const clearStoredToken = () => {
  localStorage.removeItem(storageTokenKey);
};

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredToken();
      window.dispatchEvent(new Event("auth:logout"));
    }

    return Promise.reject(error);
  }
);