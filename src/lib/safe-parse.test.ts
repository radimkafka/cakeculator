import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import * as z from "zod/mini"
import { parseOrFallback } from "./safe-parse"

describe("parseOrFallback", () => {
  let warn: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  })
  afterEach(() => {
    warn.mockRestore()
  })

  it("returns parsed value on success", () => {
    expect(parseOrFallback(z.number(), 42, 0, "ctx")).toBe(42)
    expect(warn).not.toHaveBeenCalled()
  })

  it("returns fallback and warns on failure", () => {
    expect(parseOrFallback(z.number(), "nope", 0, "ctx")).toBe(0)
    expect(warn).toHaveBeenCalledOnce()
  })
})
