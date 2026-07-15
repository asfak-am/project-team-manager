import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is missing from the frontend environment."
  );
}

export const apiClient = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  withXSRFToken: true,

  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",

  headers: {
    Accept: "application/json",
  },
});