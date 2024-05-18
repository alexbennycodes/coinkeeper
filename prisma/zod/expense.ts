import * as z from "zod"
import { CompleteUser, relatedUserSchema } from "./index"

export const expenseSchema = z.object({
  id: z.string(),
  expenseType: z.string(),
  amount: z.number(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteExpense extends z.infer<typeof expenseSchema> {
  user: CompleteUser
}

/**
 * relatedExpenseSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedExpenseSchema: z.ZodSchema<CompleteExpense> = z.lazy(() => expenseSchema.extend({
  user: relatedUserSchema,
}))
