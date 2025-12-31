import { cookies } from "next/headers";
import { apiFetch } from "./api";

export async function serverApiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const cookieStore = await cookies();
  const headers = new Headers(options.headers);
  headers.set("Cookie", cookieStore.toString());
  return apiFetch<T>(path, {
    ...options,
    headers,
  });
} 