import { Router } from "express";
import {getExpenses,
  getExpenseById,
  createExpense,
  deleteExpense,
  editExpense
} from "../controllers/expense.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { createExpenseSchema, updateExpenseSchema } from "../schemas/expense.schema.js";

const router = Router();

router.get("/", getExpenses);
router.get("/:id", getExpenseById);
router.post("/", validateBody(createExpenseSchema), createExpense);
router.delete("/:id", deleteExpense);
router.patch("/:id", validateBody(updateExpenseSchema), editExpense);

export default router;
