import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getExpenseById } from "@/lib/api/expenses/queries";
import OptimisticExpense from "./OptimisticExpense";
import { checkAuth } from "@/lib/auth/utils";


import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function ExpensePage({
  params,
}: {
  params: { expenseId: string };
}) {

  return (
    <main className="overflow-auto">
      <Expense id={params.expenseId} />
    </main>
  );
}

const Expense = async ({ id }: { id: string }) => {
  await checkAuth();

  const { expense } = await getExpenseById(id);
  

  if (!expense) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="expenses" />
        <OptimisticExpense expense={expense}  />
      </div>
    </Suspense>
  );
};
