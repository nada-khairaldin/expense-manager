import express from "express";
import expenseRoutes from "./routes/expense.routes.js";

const app = express();

app.use(express.json());
app.use("/expenses", expenseRoutes);


export default app;