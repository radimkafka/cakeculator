import * as z from "zod/mini"

export const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
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
