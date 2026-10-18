import type { Request, Response } from "express";
import {
  fetchCategories,
  fetchCategoryById,
  addCategory,
  updateCategory,
  removeCategory,
} from "../services/category.service.js";
import { AppError } from "../errors/app-error.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../schemas/category.schema.js";

function getUserId(req: Request): string {
  if (!req.user?.id) {
    throw new AppError(401, "Authentication required");
  }
  return req.user.id;
}

function getCategoryIdParam(req: Request): string {
  const id = req.params.id;
  if (!id || typeof id !== "string" || id.trim() === "") {
    throw new AppError(400, "Invalid category ID");
  }
  return id.trim();
}

export async function getCategories(req: Request, res: Response) {
  const userId = getUserId(req);
  const includeArchived = req.query.includeArchived === "true";
  const categories = await fetchCategories(userId, includeArchived);
  res.json(categories);
}

export async function getCategoryById(req: Request, res: Response) {
  const userId = getUserId(req);
  const id = getCategoryIdParam(req);

  const category = await fetchCategoryById(userId, id);

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  res.json(category);
}

export async function createCategory(req: Request, res: Response) {
  const userId = getUserId(req);
  const input = req.body as CreateCategoryInput;
  const category = await addCategory(userId, input);

  res.status(201).json(category);
}

export async function editCategory(req: Request, res: Response) {
  const userId = getUserId(req);
  const id = getCategoryIdParam(req);
  const input = req.body as UpdateCategoryInput;

  const category = await updateCategory(userId, id, input);

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  res.json(category);
}

export async function deleteCategory(req: Request, res: Response) {
  const userId = getUserId(req);
  const id = getCategoryIdParam(req);

  const deleted = await removeCategory(userId, id);

  if (!deleted) {
    throw new AppError(404, "Category not found");
  }

  res.status(204).send();
}