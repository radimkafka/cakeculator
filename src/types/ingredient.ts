import * as z from "zod/mini"

export const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  unitPrice: z.number(),
  amount: z.number(),
})

export type Ingredient = z.infer<typeof IngredientSchema>
