import express from "express";
import authRoutes from "./routes/auth.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);
app.use("/categories", categoryRoutes);
app.use("/settings", settingsRoutes);

app.use(errorMiddleware);

export default app;