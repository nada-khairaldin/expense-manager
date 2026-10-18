"use client";

import { useSyncExternalStore, useCallback } from "react";
import { CategoryItem } from "./types";
import { initialMockCategories } from "./mockData";

const STORAGE_KEY = "masroofi_categories_data";

let memoryCategories: CategoryItem[] = initialMockCategories;
let isInitialized = false;
const listeners = new Set<() => void>();

function initFromStorage() {
  if (typeof window !== "undefined" && !isInitialized) {
    isInitialized = true;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryCategories = parsed;
        }
      }
    } catch {
      // storage parsing error ignored
    }
  }
}

function getSnapshot(): CategoryItem[] {
  initFromStorage();
  return memoryCategories;
}

function getServerSnapshot(): CategoryItem[] {
  return initialMockCategories;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function setStoredCategories(updated: CategoryItem[]): void {
  memoryCategories = updated;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage quota or permission error ignored
    }
  }
  listeners.forEach((listener) => listener());
}

export function resetStoredCategories(): void {
  setStoredCategories(initialMockCategories);
}

export function useCategoriesStore() {
  const categories = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const saveCategories = useCallback((updated: CategoryItem[]) => {
    setStoredCategories(updated);
  }, []);

  const resetCategories = useCallback(() => {
    resetStoredCategories();
  }, []);

  return {
    categories,
    saveCategories,
    resetCategories,
  };
}
