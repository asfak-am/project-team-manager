import axios from "axios";

type LaravelErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong."
): string {
  if (!axios.isAxiosError<LaravelErrorResponse>(error)) {
    return fallback;
  }

  const data = error.response?.data;

  if (data?.errors) {
    const firstError = Object.values(data.errors)
      .flat()
      .at(0);

    if (firstError) {
      return firstError;
    }
  }

  return data?.message ?? fallback;
}

export function getApiStatus(error: unknown): number | null {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  return error.response?.status ?? null;
}