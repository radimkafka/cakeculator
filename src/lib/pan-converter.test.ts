import { describe, it, expect } from "vitest";
import { equivalentRoundDiameter } from "./pan-converter";

describe("equivalentRoundDiameter", () => {
  it("returns 22.6 for a 20x20x5 dish at round height 5", () => {
    expect(equivalentRoundDiameter(20, 20, 5, 5)).toBe(22.6);
  });

  it("returns 30.9 for a 20x30x5 dish at round height 4", () => {
    expect(equivalentRoundDiameter(20, 30, 5, 4)).toBe(30.9);
  });

  it("depends only on the base area when heights are equal", () => {
    expect(equivalentRoundDiameter(10, 10, 4, 4)).toBe(equivalentRoundDiameter(10, 10, 9, 9));
  });

  it("recovers the diameter of a round pan with the same volume", () => {
    // 20 cm round pan at height 5 holds ~1570.8 cm3, same as 15.708x20x5
    expect(equivalentRoundDiameter(15.708, 20, 5, 5)).toBe(20);
  });

  it("rounds to the nearest whole number with round mode", () => {
    // exact diameter is 22.57
    expect(equivalentRoundDiameter(20, 20, 5, 5, "round")).toBe(23);
    // exact diameter is 11.28
    expect(equivalentRoundDiameter(10, 10, 4, 4, "round")).toBe(11);
  });

  it("always rounds up with ceil mode", () => {
    // exact diameter is 22.57
    expect(equivalentRoundDiameter(20, 20, 5, 5, "ceil")).toBe(23);
    // exact diameter is 11.28
    expect(equivalentRoundDiameter(10, 10, 4, 4, "ceil")).toBe(12);
  });

  it("returns 0 for zero width", () => {
    expect(equivalentRoundDiameter(0, 20, 5, 5)).toBe(0);
  });

  it("returns 0 for zero length", () => {
    expect(equivalentRoundDiameter(20, 0, 5, 5)).toBe(0);
  });

  it("returns 0 for zero rectangular height", () => {
    expect(equivalentRoundDiameter(20, 20, 0, 5)).toBe(0);
  });

  it("returns 0 for zero round height", () => {
    expect(equivalentRoundDiameter(20, 20, 5, 0)).toBe(0);
  });

  it("returns 0 for negative dimensions", () => {
    expect(equivalentRoundDiameter(-20, 20, 5, 5)).toBe(0);
    expect(equivalentRoundDiameter(20, 20, 5, -5)).toBe(0);
  });
});
