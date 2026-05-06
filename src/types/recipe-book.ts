import * as z from "zod/mini"
import { UNIT_IDS, DEFAULT_UNIT } from "#/lib/units"

export const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  unit: z._default(z.enum(UNIT_IDS), DEFAULT_UNIT),
})

export type Ingredient = z.infer<typeof IngredientSchema>

export const RecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
  diameter: z.number(),
  ingredients: z.array(IngredientSchema),
})

export type Recipe = z.infer<typeof RecipeSchema>
