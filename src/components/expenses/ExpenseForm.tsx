import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/expenses/useOptimisticExpenses";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";




import { type Expense, insertExpenseParams } from "@/lib/db/schema/expenses";
import {
  createExpenseAction,
  deleteExpenseAction,
  updateExpenseAction,
} from "@/lib/actions/expenses";


const ExpenseForm = ({
  
  expense,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  expense?: Expense | null;
  
  openModal?: (expense?: Expense) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Expense>(insertExpenseParams);
  const editing = !!expense?.id;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("expenses");


  const onSuccess = (
    action: Action,
    data?: { error: string; values: Expense },
  ) => {
    const failed = Boolean(data?.error);
    if (failed) {
      openModal && openModal(data?.values);
      toast.error(`Failed to ${action}`, {
        description: data?.error ?? "Error",
      });
    } else {
      router.refresh();
      postSuccess && postSuccess();
      toast.success(`Expense ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const expenseParsed = await insertExpenseParams.safeParseAsync({  ...payload });
    if (!expenseParsed.success) {
      setErrors(expenseParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = expenseParsed.data;
    const pendingExpense: Expense = {
      updatedAt: expense?.updatedAt ?? new Date(),
      createdAt: expense?.createdAt ?? new Date(),
      id: expense?.id ?? "",
      userId: expense?.userId ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: pendingExpense,
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateExpenseAction({ ...values, id: expense.id })
          : await createExpenseAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingExpense 
        };
        onSuccess(
          editing ? "update" : "create",
          error ? errorFormatted : undefined,
        );
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(e.flatten().fieldErrors);
      }
    }
  };

  return (
    <form action={handleSubmit} onChange={handleChange} className={"space-y-8"}>
      {/* Schema fields start */}
              <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.expenseType ? "text-destructive" : "",
          )}
        >
          Expense Type
        </Label>
        <Input
          type="text"
          name="expenseType"
          className={cn(errors?.expenseType ? "ring ring-destructive" : "")}
          defaultValue={expense?.expenseType ?? ""}
        />
        {errors?.expenseType ? (
          <p className="text-xs text-destructive mt-2">{errors.expenseType[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
        <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.amount ? "text-destructive" : "",
          )}
        >
          Amount
        </Label>
        <Input
          type="text"
          name="amount"
          className={cn(errors?.amount ? "ring ring-destructive" : "")}
          defaultValue={expense?.amount ?? ""}
        />
        {errors?.amount ? (
          <p className="text-xs text-destructive mt-2">{errors.amount[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      {/* Schema fields end */}

      {/* Save Button */}
      <SaveButton errors={hasErrors} editing={editing} />

      {/* Delete Button */}
      {editing ? (
        <Button
          type="button"
          disabled={isDeleting || pending || hasErrors}
          variant={"destructive"}
          onClick={() => {
            setIsDeleting(true);
            closeModal && closeModal();
            startMutation(async () => {
              addOptimistic && addOptimistic({ action: "delete", data: expense });
              const error = await deleteExpenseAction(expense.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: expense,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default ExpenseForm;

const SaveButton = ({
  editing,
  errors,
}: {
  editing: Boolean;
  errors: boolean;
}) => {
  const { pending } = useFormStatus();
  const isCreating = pending && editing === false;
  const isUpdating = pending && editing === true;
  return (
    <Button
      type="submit"
      className="mr-2"
      disabled={isCreating || isUpdating || errors}
      aria-disabled={isCreating || isUpdating || errors}
    >
      {editing
        ? `Sav${isUpdating ? "ing..." : "e"}`
        : `Creat${isCreating ? "ing..." : "e"}`}
    </Button>
  );
};
