import express from "express";
import authRoutes from "./routes/auth.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import budgetCycleRoutes from "./routes/budget-cycle.routes.js";
import reportRoutes from "./routes/report.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// CORS middleware for frontend communication
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);
app.use("/categories", categoryRoutes);
app.use("/settings", settingsRoutes);
app.use("/budget-cycles", budgetCycleRoutes);
app.use("/reports", reportRoutes);
app.use("/dashboard", dashboardRoutes);

app.use(errorMiddleware);

export default app;