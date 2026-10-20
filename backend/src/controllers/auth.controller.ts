import type { Request, Response } from "express";
import { registerUser, loginUser, getMe, updateUserProfile } from "../services/auth.service.js";
import { AppError } from "../errors/app-error.js";
import type { RegisterInput, LoginInput, UpdateProfileInput } from "../schemas/auth.schema.js";

export async function register(req: Request, res: Response) {
  const input = req.body as RegisterInput;
  const result = await registerUser(input);

  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const input = req.body as LoginInput;
  const result = await loginUser(input);

  res.status(200).json(result);
}

export async function getCurrentUser(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Unauthorized");
  }

  const user = await getMe(req.user.id);

  res.status(200).json(user);
}

export async function updateProfile(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Unauthorized");
  }

  const input = req.body as UpdateProfileInput;
  const updated = await updateUserProfile(req.user.id, input);

  res.status(200).json(updated);
}
