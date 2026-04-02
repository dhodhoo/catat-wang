import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().int().positive(),
  transactionDate: z.string().min(1),
  categoryId: z.string().uuid().optional(),
  note: z.string().optional().nullable(),
  reviewStatus: z.enum(["clear", "need_review"]).optional()
});

export const updateTransactionSchema = createTransactionSchema.partial().extend({
  reviewStatus: z.enum(["clear", "need_review"]).optional()
});
