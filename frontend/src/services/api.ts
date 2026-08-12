import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const TOKEN_STORAGE_KEY = 'visionpath_token';
export const USER_STORAGE_KEY = 'visionpath_user';

/** Error carrying the message the API actually sent, so the UI can show it verbatim. */
export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const tokenStorage = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  },
  set(token: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },
  clear(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
  },
};

/**
 * FastAPI reports errors as `detail`, which is a string for our own
 * HTTPExceptions and an array of field errors for request-validation failures.
 * Flatten both into one readable sentence.
 */
function readErrorMessage(error: AxiosError): string {
  const data = error.response?.data as
    | { detail?: string | Array<{ loc?: (string | number)[]; msg?: string }> }
    | undefined;
  const detail = data?.detail;

  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => {
        const field = item.loc?.filter((part) => part !== 'body').join('.');
        const message = (item.msg || 'is invalid').replace(/^Value error,\s*/i, '');
        return field ? `${field}: ${message}` : message;
      })
      .join('. ');
  }

  if (error.code === 'ECONNABORTED') {
    return 'The server took too long to respond. Please try again.';
  }

  if (!error.response) {
    return 'Cannot reach the VisionPath server. Make sure the backend is running on ' + API_URL + '.';
  }

  return error.message || 'Something went wrong. Please try again.';
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      const token = tokenStorage.get();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const status = error.response?.status ?? 0;

        // An expired or missing session sends the user back to sign in — but
        // never from the auth pages themselves, which would loop.
        if (status === 401 && typeof window !== 'undefined') {
          const path = window.location.pathname;
          const onAuthPage =
            path.startsWith('/login') ||
            path.startsWith('/register') ||
            path.startsWith('/forgot-password');

          if (!onAuthPage) {
            tokenStorage.clear();
            window.location.href = '/login';
          }
        }

        return Promise.reject(
          new ApiError(readErrorMessage(error), status, error.response?.data)
        );
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  async upload<T>(
    url: string,
    file: File,
    fields: Record<string, string> = {},
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value));

    const response: AxiosResponse<T> = await this.client.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
    return response.data;
  }
}

export const api = new ApiClient();
export { API_URL };
