// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { loadAuthState, saveAuthState } from "./auth-storage"

const validUser = { sub: "abc", name: "Ada", email: "ada@example.com" }

describe("loadAuthState", () => {
  let warn: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    window.localStorage.clear()
    warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  })
  afterEach(() => {
    warn.mockRestore()
  })

  it("returns idle when no user is stored", () => {
    expect(loadAuthState()).toEqual({
      status: "idle",
      user: null,
      accessToken: null,
      tokenExpiry: null,
    })
  })

  it("returns authenticated when token is fresh", () => {
    const future = Date.now() + 60_000
    saveAuthState(validUser, "tok", future)
    const state = loadAuthState()
    expect(state.status).toBe("authenticated")
    expect(state.accessToken).toBe("tok")
    expect(state.user).toEqual(validUser)
  })

  it("returns expired when the token has expired", () => {
    const past = Date.now() - 1_000
    saveAuthState(validUser, "tok", past)
    const state = loadAuthState()
    expect(state.status).toBe("expired")
    expect(state.accessToken).toBeNull()
    expect(state.user).toEqual(validUser)
  })

  it("falls back to idle and warns on missing required field", () => {
    window.localStorage.setItem(
      "cakeculator-auth-user",
      JSON.stringify({ name: "no sub", email: "x@y.z" }),
    )
    expect(loadAuthState().status).toBe("idle")
    expect(warn).toHaveBeenCalledOnce()
  })

  it("falls back to idle and warns on malformed JSON", () => {
    window.localStorage.setItem("cakeculator-auth-user", "{not json")
    expect(loadAuthState().status).toBe("idle")
    expect(warn).toHaveBeenCalledOnce()
  })
})
