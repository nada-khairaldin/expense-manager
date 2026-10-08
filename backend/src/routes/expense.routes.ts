import {Router} from "express";
import {getExpenses,getExpenseById, createExpense } from "../controllers/expense.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { createExpenseSchema } from "../schemas/expense.schema.js";

const router = Router();

router.get("/", getExpenses);
router.get("/:id", getExpenseById);

router.post("/", 
     validateBody(createExpenseSchema),
  createExpense)
export default router;