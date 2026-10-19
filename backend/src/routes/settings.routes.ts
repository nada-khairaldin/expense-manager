import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  budgetSetupSchema,
  updateDefaultBudgetSchema,
} from "../schemas/settings.schema.js";
import {
  getSettingsController,
  updateBudgetSetupController,
  updateDefaultBudgetController,
} from "../controllers/settings.controller.js";

const router = Router();

// Protect all settings endpoints with JWT authentication
router.use(authMiddleware);

router.get("/", getSettingsController);
router.get("/budget-setup", getSettingsController);
router.put("/budget-setup", validateBody(budgetSetupSchema), updateBudgetSetupController);
router.patch("/default-budget", validateBody(updateDefaultBudgetSchema), updateDefaultBudgetController);
router.put("/default-budget", validateBody(updateDefaultBudgetSchema), updateDefaultBudgetController);

export default router;
