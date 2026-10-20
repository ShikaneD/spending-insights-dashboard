import type { z } from 'zod';

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

type Params = Record<string, string | number | undefined>;

/** Fetches JSON and validates it against a Zod schema, so bad payloads fail here, once. */
export async function getJson<S extends z.ZodTypeAny>(
  path: string,
  schema: S,
  params: Params = {},
  signal?: AbortSignal,
): Promise<z.infer<S>> {
  const url = new URL(path, window.location.origin);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }
  const res = await fetch(url.toString(), { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new ApiError(`Request failed (${res.status})`, res.status);
  const parsed = schema.safeParse(await res.json());
  if (!parsed.success) throw new ApiError('Unexpected response from the server');
  return parsed.data;
}
