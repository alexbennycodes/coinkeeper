import { expenseSchema } from "@/zodAutoGenSchemas";
import { z } from "zod";
import { timestamps } from "@/lib/utils";
import { getExpenses } from "@/lib/api/expenses/queries";


// Schema for expenses - used to validate API requests
const baseSchema = expenseSchema.omit(timestamps)

export const insertExpenseSchema = baseSchema.omit({ id: true });
export const insertExpenseParams = baseSchema.extend({
  amount: z.coerce.number()
}).omit({ 
  id: true,
  userId: true
});

export const updateExpenseSchema = baseSchema;
export const updateExpenseParams = updateExpenseSchema.extend({
  amount: z.coerce.number()
}).omit({ 
  userId: true
});
export const expenseIdSchema = baseSchema.pick({ id: true });

// Types for expenses - used to type API request params and within Components
export type Expense = z.infer<typeof expenseSchema>;
export type NewExpense = z.infer<typeof insertExpenseSchema>;
export type NewExpenseParams = z.infer<typeof insertExpenseParams>;
export type UpdateExpenseParams = z.infer<typeof updateExpenseParams>;
export type ExpenseId = z.infer<typeof expenseIdSchema>["id"];
    
// this type infers the return from getExpenses() - meaning it will include any joins
export type CompleteExpense = Awaited<ReturnType<typeof getExpenses>>["expenses"][number];

