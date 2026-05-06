import * as z from "zod/mini"

export const GoogleUserProfileSchema = z.object({
  sub: z.string(),
  name: z.string(),
  email: z.string(),
  picture: z.optional(z.string()),
})

export type GoogleUserProfile = z.infer<typeof GoogleUserProfileSchema>

export const AuthStateSchema = z.object({
  status: z.union([
    z.literal("idle"),
    z.literal("loading"),
    z.literal("authenticated"),
    z.literal("expired"),
  ]),
  user: z.nullable(GoogleUserProfileSchema),
  accessToken: z.nullable(z.string()),
  tokenExpiry: z.nullable(z.number()),
})

export type AuthState = z.infer<typeof AuthStateSchema>
