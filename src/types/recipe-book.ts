export type Ingredient = {
  id: string
  name: string
  amount: number
}

export type Recipe = {
  id: string
  name: string
  createdAt: number
  diameter: number
  ingredients: Ingredient[]
}
