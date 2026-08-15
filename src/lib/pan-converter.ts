export type RoundingMode = "none" | "round" | "ceil";

export function equivalentRoundDiameter(
  width: number,
  length: number,
  rectHeight: number,
  roundHeight: number,
  rounding: RoundingMode = "none",
): number {
  if (width <= 0 || length <= 0 || rectHeight <= 0 || roundHeight <= 0) {
    return 0;
  }

  const volume = width * length * rectHeight;
  const diameter = 2 * Math.sqrt(volume / (Math.PI * roundHeight));
  if (rounding === "round") {
    return Math.round(diameter);
  }
  if (rounding === "ceil") {
    return Math.ceil(diameter);
  }
  return Math.round(diameter * 10) / 10;
}
