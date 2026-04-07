export function panScalingCoefficient(targetDiameter: number, originalDiameter: number): number {
  if (originalDiameter <= 0 || targetDiameter <= 0) {
    return 0
  }

  const ratio = targetDiameter / originalDiameter
  const squared = ratio ** 2
  return Math.round(squared * 100) / 100
}
