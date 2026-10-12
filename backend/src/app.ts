import express from "express";
import expenseRoutes from "./routes/expense.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

app.use("/expenses", expenseRoutes);
app.use("/categories", categoryRoutes);

app.use(errorMiddleware);

export default app;