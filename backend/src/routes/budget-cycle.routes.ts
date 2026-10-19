import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { updateCycleBudgetSchema } from "../schemas/budget-cycle.schema.js";
import {
  getCurrentBudgetCycleController,
  updateCurrentCycleBudgetController,
  updateCycleBudgetByIdController,
} from "../controllers/budget-cycle.controller.js";

const router = Router();

// Protect all budget cycle routes with JWT authentication
router.use(authMiddleware);

router.get("/current", getCurrentBudgetCycleController);
router.patch("/current", validateBody(updateCycleBudgetSchema), updateCurrentCycleBudgetController);
router.put("/current", validateBody(updateCycleBudgetSchema), updateCurrentCycleBudgetController);

router.patch("/:id", validateBody(updateCycleBudgetSchema), updateCycleBudgetByIdController);
router.put("/:id", validateBody(updateCycleBudgetSchema), updateCycleBudgetByIdController);

export default router;
