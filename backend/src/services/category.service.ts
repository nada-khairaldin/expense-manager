
import type { CreateCategoryInput, UpdateCategoryInput } from "../schemas/category.schema.js";

export type Category = CreateCategoryInput & {
  id: number;
};

const categories: Category[] = [
  {
    id: 1,
    name: "Groceries",
    color: "#22C55E",
    icon: "shopping-cart",
  },
  {
    id: 2,
    name: "Education",
    color: "#3B82F6",
    icon: "book-open",
  },
];

export function fetchCategories(): Category[] {
  return categories;
}

export function fetchCategoryById(
  id: number,
): Category | undefined {
  return categories.find((category) => category.id === id);
}

export function addCategory(
  input: CreateCategoryInput,
): Category {
  const nextId =
    Math.max(0, ...categories.map((category) => category.id)) + 1;

  const category: Category = {
    id: nextId,
    ...input,
  };

  categories.push(category);
  return category;
}

export function updateCategory(
  id: number,
  input: UpdateCategoryInput,
): Category | undefined {
  const category = categories.find((item) => item.id === id);

  if (!category) return undefined;

  Object.assign(category, input);
  return category;
}

export function removeCategory(id: number): boolean {
  const index = categories.findIndex((category) => category.id === id);

  if (index === -1) return false;

  categories.splice(index, 1);
  return true;
}
