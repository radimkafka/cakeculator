import * as z from "zod/mini"

export function parseOrFallback<T>(
  schema: z.ZodMiniType<T>,
  raw: unknown,
  fallback: T,
  context: string,
): T {
  const result = schema.safeParse(raw)
  if (result.success) return result.data
  console.warn(`[cakeculator] invalid ${context} in storage; using defaults`, result.error.issues)
  return fallback
}
