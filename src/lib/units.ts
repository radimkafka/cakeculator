export type UnitId = "g" | "ml" | "tbsp" | "tsp" | "pcs"

export type UnitDef = {
  id: UnitId
  label: string
  priceUnitLabel: string
  conversionFactor: number
}

export const UNITS: Record<UnitId, UnitDef> = {
  g: { id: "g", label: "g", priceUnitLabel: "kg", conversionFactor: 1000 },
  ml: { id: "ml", label: "ml", priceUnitLabel: "l", conversionFactor: 1000 },
  tbsp: { id: "tbsp", label: "tbsp", priceUnitLabel: "tbsp", conversionFactor: 1 },
  tsp: { id: "tsp", label: "tsp", priceUnitLabel: "tsp", conversionFactor: 1 },
  pcs: { id: "pcs", label: "pcs", priceUnitLabel: "pcs", conversionFactor: 1 },
}

export const UNIT_IDS = ["g", "ml", "tbsp", "tsp", "pcs"] as const satisfies readonly UnitId[]

export const DEFAULT_UNIT: UnitId = "g"
