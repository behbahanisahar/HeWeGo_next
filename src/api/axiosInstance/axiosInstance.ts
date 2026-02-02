import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const baseURL = 'https://hewego.azurewebsites.net/';

const AUTH_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'userInfo';

const getAccessToken = (): string => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
  return token ?? '';
};

const getRefreshToken = (): string => {
  const token = localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  return token ?? '';
};

const getStorage = (): Storage => {
  if (localStorage.getItem(AUTH_TOKEN_KEY)) return localStorage;
  return sessionStorage;
};

/** Clear auth and redirect to login (e.g. when token expired and refresh failed). */
const clearAuthAndRedirect = (): void => {
  [localStorage, sessionStorage].forEach((storage) => {
    storage.removeItem(AUTH_TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
    storage.removeItem(USER_INFO_KEY);
  });
  window.location.href = `/login?session_expired=1&from=${encodeURIComponent(window.location.pathname + window.location.search)}`;
};

/**
 * Call backend refresh endpoint to get a new access token.
 * Uses fetch to avoid going through axios interceptors.
 * Backend: POST /api/refresh with body { refresh_token }, returns { access_token, refresh_token? }.
 * If your backend uses a different path (e.g. /api/token/refresh), change the URL below.
 */
const REFRESH_ENDPOINT = '/api/refresh';
const refreshAccessToken = async (): Promise<{ access_token: string; refresh_token?: string } | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${baseURL}${REFRESH_ENDPOINT.replace(/^\//, '')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string; refresh_token?: string };
    if (!data?.access_token) return null;
    return { access_token: data.access_token, refresh_token: data.refresh_token };
  } catch {
    return null;
  }
};

export const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  headers: {
    Authorization: getAccessToken() ? `Bearer ${getAccessToken()}` : '',
  },
});

// Keep auth header in sync after login/logout
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers = config.headers ?? {};
  const token = getAccessToken();
  config.headers.Authorization = token ? `Bearer ${token}` : '';
  return config;
});

// On 401: try to refresh token, retry request; otherwise clear auth and redirect to login
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, newToken: string | null) => {
  failedQueue.forEach((prom) => {
    if (newToken) prom.resolve(newToken);
    else prom.reject(error);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error?.config;
    const config = originalConfig as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error?.response?.status !== 401 || !originalConfig || config._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Wait for the ongoing refresh to finish, then retry with new token
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalConfig.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalConfig);
        })
        .catch((err) => Promise.reject(err));
    }

    config._retry = true;
    isRefreshing = true;

    const newTokens = await refreshAccessToken();
    if (newTokens) {
      const storage = getStorage();
      storage.setItem(AUTH_TOKEN_KEY, newTokens.access_token);
      if (newTokens.refresh_token != null) {
        storage.setItem(REFRESH_TOKEN_KEY, newTokens.refresh_token);
      }
      processQueue(null, newTokens.access_token);
      originalConfig.headers.Authorization = `Bearer ${newTokens.access_token}`;
      isRefreshing = false;
      return axiosInstance(originalConfig);
    }

    isRefreshing = false;
    processQueue(error, null);
    clearAuthAndRedirect();
    return Promise.reject(error);
  }
);
