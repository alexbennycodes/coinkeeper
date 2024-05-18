import { db } from "@/lib/db/index";
import { getUserAuth } from "@/lib/auth/utils";
import { type ExpenseId, expenseIdSchema } from "@/lib/db/schema/expenses";

export const getExpenses = async () => {
  const { session } = await getUserAuth();
  const e = await db.expense.findMany({ where: {userId: session?.user.id!}});
  return { expenses: e };
};

export const getExpenseById = async (id: ExpenseId) => {
  const { session } = await getUserAuth();
  const { id: expenseId } = expenseIdSchema.parse({ id });
  const e = await db.expense.findFirst({
    where: { id: expenseId, userId: session?.user.id!}});
  return { expense: e };
};


