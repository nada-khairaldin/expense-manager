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

export function getCategories(_req: Request, res: Response) {
  res.json(fetchCategories());
}

export function getCategoryById(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "Invalid category ID");
  }

  const category = fetchCategoryById(id);

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  res.json(category);
}

export function createCategory(req: Request, res: Response) {
  const input = req.body as CreateCategoryInput;
  const category = addCategory(input);

  res.status(201).json(category);
}

export function editCategory(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "Invalid category ID");
  }

  const input = req.body as UpdateCategoryInput;
  const category = updateCategory(id, input);

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  res.json(category);
}

export function deleteCategory(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "Invalid category ID");
  }

  const deleted = removeCategory(id);

  if (!deleted) {
    throw new AppError(404, "Category not found");
  }

  res.status(204).send();
}