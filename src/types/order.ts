import * as z from "zod/mini"
import { IngredientSchema } from "#/types/ingredient"

export const OrderSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
  ingredients: z.array(IngredientSchema),
})

export type Order = z.infer<typeof OrderSchema>
