import { prisma } from "../lib/prisma.js";
import app from "../app.js";
import type { Server } from "http";
import { evaluateThreshold } from "../utils/threshold.js";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

interface DashboardApiResponse {
  isSetupNeeded: boolean;
  currency: string;
  selectedPeriod: "current" | "previous";
  periodLabel: string;
  periodDateRange: string;
  budget: {
    id: string;
    startDate: string;
    endDate: string;
    budgetAmount: number;
    totalExpenses: number;
    remainingBudget: number;
    consumptionPercentage: number;
    isOverBudget: boolean;
    status: string;
    level: string;
    color: string;
    warningMessage?: string;
  } | null;
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    spent: number;
    limit: number | null;
    remaining: number | null;
    percentage: number | null;
    status: string;
    level: string;
    colorStatus: string;
    warningMessage?: string;
    transactionCount: number;
  }>;
  dailySpending: Array<{
    dayLabel: string;
    fullDate: string;
    amount: number;
    count: number;
  }>;
  recentExpenses: Array<{
    id: string;
    amount: number;
    categoryId: string | null;
    categoryName: string;
    categoryIcon: string | null;
    categoryColor: string | null;
    description: string | null;
    date: string;
    expenseDate: string;
  }>;
}

async function runDashboardTests(baseUrl: string) {
  console.log("\n========================================================");
  console.log("Starting Real Dashboard Backend & Financial Verification");
  console.log("========================================================\n");

  // 1. Verify warning threshold boundaries directly
  console.log("1. Verifying Warning Threshold Boundaries...");
  const t80 = evaluateThreshold(800, 1000, "الميزانية");
  assert(t80.status === "within_limit", "80% must be within_limit");
  assert(t80.color === "green", "80% must be green");
  assert(!t80.message, "80% should have no warning message");

  const t84_99 = evaluateThreshold(849.9, 1000, "الميزانية");
  assert(t84_99.status === "within_limit", "84.99% must be within_limit");
  assert(t84_99.color === "green", "84.99% must be green");

  const t85 = evaluateThreshold(850, 1000, "الميزانية");
  assert(t85.status === "approaching_limit", "85% must be approaching_limit");
  assert(t85.color === "yellow", "85% must be yellow");
  assert(Boolean(t85.message), "85% must have caution message");

  const t94 = evaluateThreshold(940, 1000, "الميزانية");
  assert(t94.status === "approaching_limit", "94% must be approaching_limit");
  assert(t94.color === "yellow", "94% must be yellow");

  const t95 = evaluateThreshold(950, 1000, "الميزانية");
  assert(t95.status === "critical", "95% must be critical");
  assert(t95.color === "red", "95% must be red");

  const t100 = evaluateThreshold(1000, 1000, "الميزانية");
  assert(t100.status === "exceeded", "100% must be exceeded");
  assert(t100.color === "red", "100% must be red");
  assert(t100.isOverLimit === true, "100% must be over limit");

  const t110 = evaluateThreshold(1100, 1000, "الميزانية");
  assert(t110.status === "exceeded", "110% must be exceeded");
  assert(t110.percentage === 110, "110% must display 110%");
  assert(t110.remaining === -100, "110% remaining must be -100");

  const tNoLimit = evaluateThreshold(500, null, "تصنيف بدون سقف");
  assert(tNoLimit.status === "no_limit", "Null limit must be no_limit");
  assert(tNoLimit.level === "none", "Null limit must have level none");
  console.log("✓ All warning thresholds validated (80%, 84.99%, 85%, 94%, 95%, 100%, 110%, no limit)\n");

  const timestamp = Date.now();
  const testEmailA = `dash-user-a-${timestamp}@example.com`;
  const testEmailB = `dash-user-b-${timestamp}@example.com`;

  try {
    // 2. Unauthenticated request protection
    console.log("2. Verifying Authentication Enforcement on /dashboard...");
    const unauthGet = await fetch(`${baseUrl}/dashboard`);
    assert(
      unauthGet.status === 401,
      `Expected 401 for unauthenticated GET /dashboard, got ${unauthGet.status}`,
    );
    console.log("✓ Unauthenticated access correctly blocked with 401\n");

    // 3. Register User A and User B
    console.log("3. Registering Test Users A and B...");
    const regA = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "User A Dashboard",
        email: testEmailA,
        password: "Password123!",
      }),
    });
    assert(regA.status === 201, `Failed to register User A: ${regA.status}`);
    const authA = (await regA.json()) as AuthResponse;

    const regB = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "User B Dashboard",
        email: testEmailB,
        password: "Password123!",
      }),
    });
    assert(regB.status === 201, `Failed to register User B: ${regB.status}`);
    const authB = (await regB.json()) as AuthResponse;
    console.log("✓ Test users registered successfully\n");

    // 4. Initial Dashboard call before budget setup
    console.log("4. Verifying Dashboard before budget setup...");
    const preSetupRes = await fetch(`${baseUrl}/dashboard`, {
      headers: { Authorization: `Bearer ${authA.token}` },
    });
    assert(preSetupRes.status === 200, `Failed to get dashboard: ${preSetupRes.status}`);
    const preSetupData = (await preSetupRes.json()) as DashboardApiResponse;
    assert(preSetupData.isSetupNeeded === true, "isSetupNeeded must be true before setup");
    assert(preSetupData.budget === null, "budget must be null before setup");
    console.log("✓ Setup needed state handled gracefully\n");

    // 5. Configure Budget for User A
    console.log("5. Configuring User A Budget Settings...");
    const setupRes = await fetch(`${baseUrl}/settings/budget-setup`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authA.token}`,
      },
      body: JSON.stringify({
        currency: "USD",
        budgetRenewalDay: 1,
        defaultBudgetAmount: 2000,
      }),
    });
    assert(setupRes.status === 200, `Failed budget setup: ${setupRes.status}`);
    console.log("✓ Budget setup complete (Currency: USD, Budget: 2000)\n");

    // 6. Create Categories for User A:
    // Category 1: with limit 500
    // Category 2: without limit
    console.log("6. Creating Test Categories...");
    const cat1Res = await fetch(`${baseUrl}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authA.token}`,
      },
      body: JSON.stringify({
        name: "Food & Groceries",
        icon: "ShoppingCart",
        color: "#10B981",
        monthlyLimit: 500,
      }),
    });
    const cat1 = (await cat1Res.json()) as { id: string };

    const cat2Res = await fetch(`${baseUrl}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authA.token}`,
      },
      body: JSON.stringify({
        name: "Miscellaneous",
        icon: "Layers",
        color: "#64748B",
      }),
    });
    const cat2 = (await cat2Res.json()) as { id: string };

    // 7. Add expenses for User A
    console.log("7. Adding Expenses for User A...");
    const todayStr = new Date().toISOString().slice(0, 10);

    // Expense 1: 450 in Category 1 (450 / 500 = 90% -> approaching limit / yellow)
    await fetch(`${baseUrl}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authA.token}`,
      },
      body: JSON.stringify({
        amount: 450,
        categoryId: cat1.id,
        description: "Grocery haul",
        date: todayStr,
      }),
    });

    // Expense 2: 150 in Category 2 (no limit)
    await fetch(`${baseUrl}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authA.token}`,
      },
      body: JSON.stringify({
        amount: 150,
        categoryId: cat2.id,
        description: "Hardware tools",
        date: todayStr,
      }),
    });

    // Expense 3: 50 uncategorized
    await fetch(`${baseUrl}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authA.token}`,
      },
      body: JSON.stringify({
        amount: 50,
        description: "Street snack",
        date: todayStr,
      }),
    });
    console.log("✓ Expenses added (Total: 650 USD)\n");

    // 8. Fetch and verify Dashboard data
    console.log("8. Verifying Dashboard Output against Real Data...");
    const dashRes = await fetch(`${baseUrl}/dashboard`, {
      headers: { Authorization: `Bearer ${authA.token}` },
    });
    assert(dashRes.status === 200, `Failed to get dashboard: ${dashRes.status}`);
    const dash = (await dashRes.json()) as DashboardApiResponse;

    assert(dash.currency === "USD", `Expected currency USD, got ${dash.currency}`);
    assert(dash.budget !== null, "Budget must not be null after setup");
    assert(dash.budget!.budgetAmount === 2000, `Expected budget 2000, got ${dash.budget!.budgetAmount}`);
    assert(dash.budget!.totalExpenses === 650, `Expected totalExpenses 650, got ${dash.budget!.totalExpenses}`);
    assert(dash.budget!.remainingBudget === 1350, `Expected remaining 1350, got ${dash.budget!.remainingBudget}`);
    assert(dash.budget!.consumptionPercentage === 32.5, `Expected 32.5%, got ${dash.budget!.consumptionPercentage}`);
    assert(dash.budget!.status === "within_limit", `Expected within_limit, got ${dash.budget!.status}`);
    assert(dash.budget!.color === "green", `Expected green, got ${dash.budget!.color}`);

    // Verify Category 1 (limit 500, spent 450 -> 90% -> approaching_limit / yellow)
    const cat1Item = dash.categories.find((c) => c.id === cat1.id);
    assert(Boolean(cat1Item), "Category 1 must be present in dashboard categories");
    assert(cat1Item!.spent === 450, `Expected 450 spent in cat1, got ${cat1Item!.spent}`);
    assert(cat1Item!.limit === 500, `Expected 500 limit in cat1, got ${cat1Item!.limit}`);
    assert(cat1Item!.percentage === 90, `Expected 90% in cat1, got ${cat1Item!.percentage}`);
    assert(cat1Item!.status === "approaching_limit", `Expected approaching_limit, got ${cat1Item!.status}`);
    assert(cat1Item!.colorStatus === "yellow", `Expected yellow, got ${cat1Item!.colorStatus}`);

    // Verify Category 2 (no limit)
    const cat2Item = dash.categories.find((c) => c.id === cat2.id);
    assert(Boolean(cat2Item), "Category 2 must be present in dashboard categories");
    assert(cat2Item!.spent === 150, `Expected 150 spent in cat2, got ${cat2Item!.spent}`);
    assert(cat2Item!.limit === null, "Category 2 limit must be null");
    assert(cat2Item!.percentage === null, "Category 2 percentage must be null");
    assert(cat2Item!.status === "no_limit", "Category 2 status must be no_limit");

    // Verify Uncategorized spending
    const uncatItem = dash.categories.find((c) => c.id === "uncategorized");
    assert(Boolean(uncatItem), "Uncategorized spending must be listed in categories");
    assert(uncatItem!.spent === 50, `Expected 50 uncategorized spent, got ${uncatItem!.spent}`);

    // Verify reconciliation of categories spending with totalExpenses
    const sumCategories = dash.categories.reduce((acc, c) => acc + c.spent, 0);
    assert(
      Math.abs(sumCategories - dash.budget!.totalExpenses) < 0.01,
      `Categories sum (${sumCategories}) must equal totalExpenses (${dash.budget!.totalExpenses})`,
    );
    console.log("✓ Financial metrics and category threshold warnings verified\n");

    // 9. Verify Daily Spending Trajectory & Gap-Filling
    console.log("9. Verifying Daily Spending Trajectory...");
    assert(dash.dailySpending.length > 0, "dailySpending must not be empty");
    const todayPoint = dash.dailySpending.find((p) => p.fullDate === todayStr);
    assert(Boolean(todayPoint), `Must have data point for today (${todayStr})`);
    assert(todayPoint!.amount === 650, `Expected 650 for today, got ${todayPoint!.amount}`);
    assert(todayPoint!.count === 3, `Expected 3 transactions today, got ${todayPoint!.count}`);
    console.log("✓ Daily spending trajectory verified\n");

    // 10. Verify Recent Expenses
    console.log("10. Verifying Recent Expenses List...");
    assert(dash.recentExpenses.length === 3, `Expected 3 recent expenses, got ${dash.recentExpenses.length}`);
    assert(dash.recentExpenses[0]!.amount > 0, "Expense amount must be positive");
    console.log("✓ Recent expenses list verified\n");

    // 11. Verify User Isolation
    console.log("11. Verifying User Isolation...");
    const dashBRes = await fetch(`${baseUrl}/dashboard`, {
      headers: { Authorization: `Bearer ${authB.token}` },
    });
    const dashB = (await dashBRes.json()) as DashboardApiResponse;
    assert(dashB.isSetupNeeded === true, "User B must have isSetupNeeded true");
    assert(dashB.recentExpenses.length === 0, "User B must have 0 recent expenses");
    assert(dashB.categories.length === 0, "User B must have 0 categories");
    console.log("✓ User B cannot see User A's data\n");

    console.log("========================================================");
    console.log("🎉 ALL DASHBOARD BACKEND & DATA TESTS PASSED!");
    console.log("========================================================\n");
  } finally {
    console.log("Cleaning up test users and data...");
    await prisma.expense.deleteMany({
      where: { user: { email: { in: [testEmailA, testEmailB] } } },
    });
    await prisma.categoryBudget.deleteMany({
      where: { budgetCycle: { user: { email: { in: [testEmailA, testEmailB] } } } },
    });
    await prisma.budgetCycle.deleteMany({
      where: { user: { email: { in: [testEmailA, testEmailB] } } },
    });
    await prisma.category.deleteMany({
      where: { user: { email: { in: [testEmailA, testEmailB] } } },
    });
    await prisma.userSettings.deleteMany({
      where: { user: { email: { in: [testEmailA, testEmailB] } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [testEmailA, testEmailB] } },
    });
    console.log("Cleanup completed.\n");
  }
}

async function main() {
  const port = 4998;
  const server: Server = app.listen(port);
  const baseUrl = `http://localhost:${port}`;

  try {
    await runDashboardTests(baseUrl);
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
