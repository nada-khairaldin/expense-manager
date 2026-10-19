import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/app-error.js";
import { env } from "../config/env.js";
import type { RegisterInput, LoginInput } from "../schemas/auth.schema.js";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: (env.JWT_EXPIRES_IN || "7d") as "7d",
  });
}

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      settings: {
        create: {
          currency: "ILS",
          budgetRenewalDay: 1,
          budgetSetupCompleted: false,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      settings: {
        select: {
          id: true,
          currency: true,
          budgetRenewalDay: true,
          defaultBudgetAmount: true,
          budgetSetupCompleted: true,
        },
      },
    },
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  const defaultBudget = user.settings?.defaultBudgetAmount
    ? Number(user.settings.defaultBudgetAmount)
    : null;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      currency: user.settings?.currency ?? "ILS",
      budgetRenewalDay: user.settings?.budgetRenewalDay ?? 1,
      defaultBudgetAmount: defaultBudget,
      budgetSetupCompleted: user.settings?.budgetSetupCompleted ?? false,
      settings: user.settings
        ? {
            ...user.settings,
            defaultBudgetAmount: defaultBudget,
          }
        : null,
    },
    token,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: {
      settings: {
        select: {
          id: true,
          currency: true,
          budgetRenewalDay: true,
          defaultBudgetAmount: true,
          budgetSetupCompleted: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  const defaultBudget = user.settings?.defaultBudgetAmount
    ? Number(user.settings.defaultBudgetAmount)
    : null;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      currency: user.settings?.currency ?? "ILS",
      budgetRenewalDay: user.settings?.budgetRenewalDay ?? 1,
      defaultBudgetAmount: defaultBudget,
      budgetSetupCompleted: user.settings?.budgetSetupCompleted ?? false,
      settings: user.settings
        ? {
            ...user.settings,
            defaultBudgetAmount: defaultBudget,
          }
        : null,
    },
    token,
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      settings: {
        select: {
          id: true,
          currency: true,
          budgetRenewalDay: true,
          defaultBudgetAmount: true,
          budgetSetupCompleted: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const defaultBudget = user.settings?.defaultBudgetAmount
    ? Number(user.settings.defaultBudgetAmount)
    : null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    currency: user.settings?.currency ?? "ILS",
    budgetRenewalDay: user.settings?.budgetRenewalDay ?? 1,
    defaultBudgetAmount: defaultBudget,
    budgetSetupCompleted: user.settings?.budgetSetupCompleted ?? false,
    settings: user.settings
      ? {
          ...user.settings,
          defaultBudgetAmount: defaultBudget,
        }
      : null,
  };
}
