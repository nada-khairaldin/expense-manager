import { Router } from "express";
import { register, login, getCurrentUser, updateProfile } from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { registerSchema, loginSchema, updateProfileSchema } from "../schemas/auth.schema.js";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.get("/me", authMiddleware, getCurrentUser);
router.patch("/profile", authMiddleware, validateBody(updateProfileSchema), updateProfile);
router.put("/profile", authMiddleware, validateBody(updateProfileSchema), updateProfile);

export default router;
