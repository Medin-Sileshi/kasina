import { createAuthClient } from "better-auth/react";

export const apiBase =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

export const authClient = createAuthClient({
  baseURL: apiBase,
});

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function networkErrorMessage(err: unknown): string {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "You appear to be offline. Kasina needs a network connection for practice and assignments.";
  }
  if (err instanceof TypeError) {
    return "Cannot reach the server. Check your connection and try again.";
  }
  if (err instanceof Error) return err.message;
  return "Request failed";
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${apiBase}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch (err) {
    throw new Error(networkErrorMessage(err));
  }

  let data: T & { error?: string };
  try {
    data = (await res.json()) as T & { error?: string };
  } catch {
    throw new ApiError(
      res.ok
        ? "Invalid response from server"
        : `Request failed (${res.status})`,
      res.status,
    );
  }

  if (!res.ok) {
    throw new ApiError(
      typeof data === "object" && data && "error" in data && data.error
        ? String(data.error)
        : `Request failed (${res.status})`,
      res.status,
    );
  }
  return data;
}
