import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getFinancialReportController,
  getReportBudgetCyclesController,
} from "../controllers/report.controller.js";

const router = Router();

// Protect all reporting endpoints with authentication
router.use(authMiddleware);

router.get("/", getFinancialReportController);
router.get("/cycles", getReportBudgetCyclesController);

export default router;
