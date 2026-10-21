import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  editCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema.js";

const router = Router();

// Protect all category routes with JWT authentication
router.use(authMiddleware);

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", validateBody(createCategorySchema), createCategory);
router.patch("/:id", validateBody(updateCategorySchema), editCategory);
router.put("/:id", validateBody(updateCategorySchema), editCategory);
router.delete("/:id", deleteCategory);

export default router;