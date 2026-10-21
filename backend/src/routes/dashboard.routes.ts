import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getDashboardController } from "../controllers/dashboard.controller.js";

const router = Router();

// Protect all dashboard endpoints with authentication
router.use(authMiddleware);

router.get("/", getDashboardController);

export default router;
