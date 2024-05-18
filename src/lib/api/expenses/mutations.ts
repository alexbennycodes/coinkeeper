import { db } from "@/lib/db/index";
import { 
  ExpenseId, 
  NewExpenseParams,
  UpdateExpenseParams, 
  updateExpenseSchema,
  insertExpenseSchema, 
  expenseIdSchema 
} from "@/lib/db/schema/expenses";
import { getUserAuth } from "@/lib/auth/utils";

export const createExpense = async (expense: NewExpenseParams) => {
  const { session } = await getUserAuth();
  const newExpense = insertExpenseSchema.parse({ ...expense, userId: session?.user.id! });
  try {
    const e = await db.expense.create({ data: newExpense });
    return { expense: e };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateExpense = async (id: ExpenseId, expense: UpdateExpenseParams) => {
  const { session } = await getUserAuth();
  const { id: expenseId } = expenseIdSchema.parse({ id });
  const newExpense = updateExpenseSchema.parse({ ...expense, userId: session?.user.id! });
  try {
    const e = await db.expense.update({ where: { id: expenseId, userId: session?.user.id! }, data: newExpense})
    return { expense: e };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteExpense = async (id: ExpenseId) => {
  const { session } = await getUserAuth();
  const { id: expenseId } = expenseIdSchema.parse({ id });
  try {
    const e = await db.expense.delete({ where: { id: expenseId, userId: session?.user.id! }})
    return { expense: e };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

