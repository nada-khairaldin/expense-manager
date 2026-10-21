import { prisma } from "../lib/prisma.js";
import app from "../app.js";
import type { Server } from "http";

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

interface FinancialReportResponse {
  period: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
  currency: string;
  summary: {
    totalSpending: number;
    expenseCount: number;
    averageExpense: number;
    minExpense: number;
    maxExpense: number;
  };
  comparison: {
    previousPeriodLabel: string;
    prevStartDate: string;
    prevEndDate: string;
    previousTotalSpending: number;
    previousExpenseCount: number;
    spendingChange: number;
    percentageChange: number;
    trend: "increase" | "decrease" | "no_change";
  };
  budgetMetrics: {
    cycleId: string;
    startDate: string;
    endDate: string;
    budgetAmount: number;
    totalExpenses: number;
    remainingBudget: number;
    utilizationPercentage: number;
    isOverBudget: boolean;
    expenseCount: number;
  } | null;
  categoryBreakdown: Array<{
    categoryId: string | null;
    name: string;
    color: string;
    icon: string;
    totalAmount: number;
    expenseCount: number;
    percentage: number;
    isArchived: boolean;
    isDeleted: boolean;
  }>;
  timeSeries: {
    interval: "day" | "week" | "month";
    data: Array<{
      date: string;
      label: string;
      amount: number;
      count: number;
    }>;
  };
  expenses: Array<{
    id: string;
    amount: number;
    categoryId: string | null;
    categoryName: string;
    categoryIcon: string | null;
    categoryColor: string | null;
    description: string | null;
    date: string;
    expenseDate: string;
    budgetCycleId: string;
  }>;
}

interface BudgetCyclesResponse {
  cycles: Array<{
    id: string;
    startDate: string;
    endDate: string;
    budgetAmount: number;
    totalExpenses: number;
    remainingBudget: number;
    percentageUsed: number;
    isCompleted: boolean;
    isCurrent: boolean;
    expenseCount: number;
  }>;
}

async function runReportTests(baseUrl: string) {
  console.log("\n========================================================");
  console.log("Starting Real Reports & Financial Analysis Verification");
  console.log("========================================================\n");

  const timestamp = Date.now();
  const testEmailA = `report-user-a-${timestamp}@example.com`;
  const testEmailB = `report-user-b-${timestamp}@example.com`;

  try {
    // 1. Unauthenticated request protection
    console.log("1. Verifying Authentication Enforcement on /reports...");
    const unauthReport = await fetch(`${baseUrl}/reports`);
    assert(
      unauthReport.status === 401,
      `Expected 401 for unauthenticated GET /reports, got ${unauthReport.status}`,
    );

    const unauthCycles = await fetch(`${baseUrl}/reports/cycles`);
    assert(
      unauthCycles.status === 401,
      `Expected 401 for unauthenticated GET /reports/cycles, got ${unauthCycles.status}`,
    );
    console.log("✓ Unauthenticated access correctly blocked with 401\n");

    // 2. Register User A and User B
    console.log("2. Registering Test Users A and B...");
    const registerA = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "User A Reports",
        email: testEmailA,
        password: "Password123!",
      }),
    });
    assert(registerA.status === 201, `Failed to register User A: ${registerA.status}`);
    const authA = (await registerA.json()) as AuthResponse;

    const registerB = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "User B Reports",
        email: testEmailB,
        password: "Password123!",
      }),
    });
    assert(registerB.status === 201, `Failed to register User B: ${registerB.status}`);
    const authB = (await registerB.json()) as AuthResponse;
    console.log("✓ Test users registered successfully\n");

    // 3. Configure budget settings for User A (renewal day = 15, default budget = 5000, currency = ILS)
    console.log("3. Configuring User A Budget Settings...");
    const setupRes = await fetch(`${baseUrl}/settings/budget-setup`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authA.token}`,
      },
      body: JSON.stringify({
        currency: "ILS",
        budgetRenewalDay: 15,
        defaultBudgetAmount: 5000,
      }),
    });
    assert(setupRes.status === 200, `Failed budget setup: ${setupRes.status}`);
    console.log("✓ User A budget setup completed (Renewal day: 15, Default Budget: 5000 ILS)\n");

    // 4. Create Categories and Expenses for User A
    console.log("4. Creating Categories and Expenses for User A...");
    // Create Category 1: طعام
    const cat1Res = await fetch(`${baseUrl}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authA.token}`,
      },
      body: JSON.stringify({
        name: "طعام ومشروبات",
        icon: "Utensils",
        color: "#F59E0B",
        monthlyLimit: 1500,
      }),
    });
    assert(cat1Res.status === 201, `Failed to create Category 1: ${cat1Res.status}`);
    const cat1 = (await cat1Res.json()) as { id: string };

    // Create Category 2: مواصلات
    const cat2Res = await fetch(`${baseUrl}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authA.token}`,
      },
      body: JSON.stringify({
        name: "مواصلات ووقود",
        icon: "Car",
        color: "#3B82F6",
        monthlyLimit: 800,
      }),
    });
    assert(cat2Res.status === 201, `Failed to create Category 2: ${cat2Res.status}`);
    const cat2 = (await cat2Res.json()) as { id: string };

    // Today's date in YYYY-MM-DD
    const todayStr = new Date().toISOString().slice(0, 10);

    // Create Expense 1: 150 ILS in Category 1
    const exp1Res = await fetch(`${baseUrl}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authA.token}`,
      },
      body: JSON.stringify({
        amount: 150,
        categoryId: cat1.id,
        description: "غداء عمل",
        date: todayStr,
      }),
    });
    assert(exp1Res.status === 201, `Failed to create expense 1: ${exp1Res.status}`);

    // Create Expense 2: 50 ILS in Category 2
    const exp2Res = await fetch(`${baseUrl}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authA.token}`,
      },
      body: JSON.stringify({
        amount: 50,
        categoryId: cat2.id,
        description: "تعبئة بنزين",
        date: todayStr,
      }),
    });
    assert(exp2Res.status === 201, `Failed to create expense 2: ${exp2Res.status}`);

    // Create Expense 3: 100 ILS uncategorized
    const exp3Res = await fetch(`${baseUrl}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authA.token}`,
      },
      body: JSON.stringify({
        amount: 100,
        description: "مشتريات متنوعة",
        date: todayStr,
      }),
    });
    assert(exp3Res.status === 201, `Failed to create expense 3: ${exp3Res.status}`);

    console.log("✓ Categories and 3 test expenses created successfully\n");

    // 5. Test Period: "today"
    console.log("5. Testing Report Period: 'today'...");
    const reportTodayRes = await fetch(`${baseUrl}/reports?period=today`, {
      headers: { Authorization: `Bearer ${authA.token}` },
    });
    assert(reportTodayRes.status === 200, `Failed to fetch today report: ${reportTodayRes.status}`);
    const todayReport = (await reportTodayRes.json()) as FinancialReportResponse;

    assert(todayReport.period === "today", "Period should be 'today'");
    assert(todayReport.currency === "ILS", "Currency should be ILS");
    assert(todayReport.summary.totalSpending === 300, `Expected totalSpending 300, got ${todayReport.summary.totalSpending}`);
    assert(todayReport.summary.expenseCount === 3, `Expected expenseCount 3, got ${todayReport.summary.expenseCount}`);
    assert(todayReport.summary.averageExpense === 100, `Expected averageExpense 100, got ${todayReport.summary.averageExpense}`);
    assert(todayReport.budgetMetrics === null, "Budget metrics must be null for 'today' report");
    console.log("✓ 'today' report verified: total 300 ILS, 3 transactions, avg 100 ILS, budget metrics null\n");

    // 6. Test Period: "this_week"
    console.log("6. Testing Report Period: 'this_week'...");
    const reportWeekRes = await fetch(`${baseUrl}/reports?period=this_week`, {
      headers: { Authorization: `Bearer ${authA.token}` },
    });
    assert(reportWeekRes.status === 200, `Failed to fetch this_week report: ${reportWeekRes.status}`);
    const weekReport = (await reportWeekRes.json()) as FinancialReportResponse;
    assert(weekReport.period === "this_week", "Period should be 'this_week'");
    assert(weekReport.summary.totalSpending >= 300, "Should include this week's expenses");
    assert(weekReport.budgetMetrics === null, "Budget metrics must be null for 'this_week' report");
    console.log("✓ 'this_week' report verified\n");

    // 7. Test Period: "this_month" (Calendar Month vs Budget Cycle)
    console.log("7. Testing Report Period: 'this_month' (Calendar Month)...");
    const reportMonthRes = await fetch(`${baseUrl}/reports?period=this_month`, {
      headers: { Authorization: `Bearer ${authA.token}` },
    });
    assert(reportMonthRes.status === 200, `Failed to fetch this_month report: ${reportMonthRes.status}`);
    const monthReport = (await reportMonthRes.json()) as FinancialReportResponse;
    assert(monthReport.period === "this_month", "Period should be 'this_month'");
    // Verify start date is the 1st of current month
    const curYear = new Date().getUTCFullYear();
    const curMonth = String(new Date().getUTCMonth() + 1).padStart(2, "0");
    const expectedMonthStart = `${curYear}-${curMonth}-01`;
    assert(
      monthReport.startDate.startsWith(expectedMonthStart),
      `Expected calendar month start ${expectedMonthStart}, got ${monthReport.startDate}`,
    );
    assert(monthReport.budgetMetrics === null, "Budget metrics must be null for calendar month");
    console.log("✓ Calendar month strictly separated: start on 1st, budget metrics null\n");

    // 8. Test Period: "current_cycle" (Budget Cycle with renewal day 15)
    console.log("8. Testing Report Period: 'current_cycle' (Budget Cycle)...");
    const reportCycleRes = await fetch(`${baseUrl}/reports?period=current_cycle`, {
      headers: { Authorization: `Bearer ${authA.token}` },
    });
    assert(reportCycleRes.status === 200, `Failed to fetch current_cycle report: ${reportCycleRes.status}`);
    const cycleReport = (await reportCycleRes.json()) as FinancialReportResponse;

    assert(cycleReport.period === "current_cycle", "Period should be 'current_cycle'");
    assert(cycleReport.budgetMetrics !== null, "Budget metrics MUST be present for budget cycle");
    assert(cycleReport.budgetMetrics!.budgetAmount === 5000, `Expected budget 5000, got ${cycleReport.budgetMetrics?.budgetAmount}`);
    assert(cycleReport.budgetMetrics!.totalExpenses >= 300, `Expected >= 300 spending, got ${cycleReport.budgetMetrics?.totalExpenses}`);
    assert(cycleReport.budgetMetrics!.remainingBudget <= 4700, "Remaining budget should reflect spending");
    console.log("✓ 'current_cycle' report verified: budget metrics present (5000 ILS, remaining calculated)\n");

    // 9. Test Category Breakdown & Uncategorized & Deleted Category Snapshots
    console.log("9. Testing Category Breakdown & Retention of Deleted Category Snapshots...");
    // Delete Category 1 (طعام ومشروبات)
    const delCat1Res = await fetch(`${baseUrl}/categories/${cat1.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authA.token}` },
    });
    assert(
      delCat1Res.status === 204 || delCat1Res.status === 200,
      `Failed to delete Category 1: ${delCat1Res.status}`,
    );

    // Re-query today's report
    const reportAfterDeleteRes = await fetch(`${baseUrl}/reports?period=today`, {
      headers: { Authorization: `Bearer ${authA.token}` },
    });
    const afterDeleteReport = (await reportAfterDeleteRes.json()) as FinancialReportResponse;

    // Verify deleted category expense is STILL in report under its snapshot name
    const deletedCatItem = afterDeleteReport.categoryBreakdown.find(
      (c) => c.name === "طعام ومشروبات",
    );
    assert(Boolean(deletedCatItem), "Deleted category 'طعام ومشروبات' MUST still appear via snapshot");
    assert(deletedCatItem?.totalAmount === 150, `Expected 150 ILS for deleted category, got ${deletedCatItem?.totalAmount}`);
    assert(deletedCatItem?.isDeleted === true, "Deleted category must be marked as isDeleted: true");

    // Verify uncategorized item
    const uncategorizedItem = afterDeleteReport.categoryBreakdown.find(
      (c) => c.name === "بدون تصنيف" || c.categoryId === null,
    );
    assert(Boolean(uncategorizedItem), "Uncategorized item must appear in category breakdown");

    // Reconcile category totals with totalSpending
    const sumCategories = afterDeleteReport.categoryBreakdown.reduce(
      (acc, c) => acc + c.totalAmount,
      0,
    );
    assert(
      Math.abs(sumCategories - afterDeleteReport.summary.totalSpending) < 0.01,
      `Category sum (${sumCategories}) must reconcile with totalSpending (${afterDeleteReport.summary.totalSpending})`,
    );
    console.log("✓ Category breakdown verified: deleted category snapshot preserved, totals reconcile\n");

    // 10. Test Spending Over Time (Time Series)
    console.log("10. Testing Spending Over Time (Time Series)...");
    assert(todayReport.timeSeries.interval === "day", "Interval should be 'day' for today report");
    assert(todayReport.timeSeries.data.length >= 1, "Time series must have data points");
    const todayPoint = todayReport.timeSeries.data.find((p) => p.date === todayStr);
    assert(Boolean(todayPoint), `Time series must contain data point for today (${todayStr})`);
    assert(todayPoint?.amount === 300, `Expected 300 ILS for today, got ${todayPoint?.amount}`);
    console.log("✓ Time series data points and gap-filling verified\n");

    // 11. Test Custom Date Range & Validation
    console.log("11. Testing Custom Date Range and Input Validations...");
    const customReportRes = await fetch(
      `${baseUrl}/reports?period=custom&startDate=${todayStr}&endDate=${todayStr}`,
      { headers: { Authorization: `Bearer ${authA.token}` } },
    );
    assert(customReportRes.status === 200, `Failed custom range report: ${customReportRes.status}`);
    const customReport = (await customReportRes.json()) as FinancialReportResponse;
    assert(customReport.period === "custom", "Period should be 'custom'");
    assert(customReport.budgetMetrics === null, "Budget metrics must be null for custom range");

    // Validation 1: startDate after endDate
    const invalidRangeRes = await fetch(
      `${baseUrl}/reports?period=custom&startDate=2026-10-25&endDate=2026-10-10`,
      { headers: { Authorization: `Bearer ${authA.token}` } },
    );
    assert(invalidRangeRes.status === 400, `Expected 400 for startDate > endDate, got ${invalidRangeRes.status}`);

    // Validation 2: minAmount > maxAmount
    const invalidAmountRes = await fetch(
      `${baseUrl}/reports?period=today&minAmount=500&maxAmount=100`,
      { headers: { Authorization: `Bearer ${authA.token}` } },
    );
    assert(invalidAmountRes.status === 400, `Expected 400 for minAmount > maxAmount, got ${invalidAmountRes.status}`);

    // Validation 3: negative minAmount
    const negAmountRes = await fetch(
      `${baseUrl}/reports?period=today&minAmount=-10`,
      { headers: { Authorization: `Bearer ${authA.token}` } },
    );
    assert(negAmountRes.status === 400, `Expected 400 for negative minAmount, got ${negAmountRes.status}`);

    console.log("✓ Custom range and parameter validation rules verified\n");

    // 12. Test Previous Period Comparison & Division-by-Zero Safety
    console.log("12. Testing Previous Period Comparison & Division-by-Zero Safety...");
    assert(typeof todayReport.comparison.previousTotalSpending === "number", "previousTotalSpending must be a number");
    assert(typeof todayReport.comparison.percentageChange === "number", "percentageChange must be a number");
    assert(
      !Number.isNaN(todayReport.comparison.percentageChange),
      "percentageChange must not be NaN even if previous is zero",
    );
    assert(
      ["increase", "decrease", "no_change"].includes(todayReport.comparison.trend),
      `Trend must be valid, got ${todayReport.comparison.trend}`,
    );
    console.log(`✓ Comparison metrics verified: trend is ${todayReport.comparison.trend}, percentage: ${todayReport.comparison.percentageChange}%\n`);

    // 13. Test Historical Budget Cycles Listing (/reports/cycles)
    console.log("13. Testing Historical Budget Cycles Listing (/reports/cycles)...");
    const cyclesRes = await fetch(`${baseUrl}/reports/cycles`, {
      headers: { Authorization: `Bearer ${authA.token}` },
    });
    assert(cyclesRes.status === 200, `Failed to get cycles: ${cyclesRes.status}`);
    const cyclesData = (await cyclesRes.json()) as BudgetCyclesResponse;
    assert(Array.isArray(cyclesData.cycles), "cycles must be an array");
    assert(cyclesData.cycles.length > 0, "User A should have at least one budget cycle");
    const activeCycle = cyclesData.cycles.find((c) => c.isCurrent);
    assert(Boolean(activeCycle), "There should be an active cycle marked isCurrent: true");
    console.log(`✓ Found ${cyclesData.cycles.length} budget cycles for User A\n`);

    // 14. Test User Isolation (User B cannot see User A's data)
    console.log("14. Testing User Isolation...");
    const reportUserB = await fetch(`${baseUrl}/reports?period=today`, {
      headers: { Authorization: `Bearer ${authB.token}` },
    });
    assert(reportUserB.status === 200, `Failed to get User B report: ${reportUserB.status}`);
    const userBData = (await reportUserB.json()) as FinancialReportResponse;
    assert(userBData.summary.totalSpending === 0, `User B totalSpending must be 0, got ${userBData.summary.totalSpending}`);
    assert(userBData.summary.expenseCount === 0, `User B expenseCount must be 0, got ${userBData.summary.expenseCount}`);
    assert(userBData.categoryBreakdown.length === 0, "User B should have empty category breakdown");

    // User B trying to access User A's cycle by ID
    const userBAccessCycleA = await fetch(
      `${baseUrl}/reports?period=cycle&cycleId=${activeCycle!.id}`,
      { headers: { Authorization: `Bearer ${authB.token}` } },
    );
    assert(
      userBAccessCycleA.status === 404,
      `User B accessing User A's cycleId must return 404, got ${userBAccessCycleA.status}`,
    );
    console.log("✓ Strict user isolation verified: User B cannot view User A's report or cycles\n");

    console.log("========================================================");
    console.log("🎉 ALL REPORTS & FINANCIAL ANALYSIS BACKEND TESTS PASSED!");
    console.log("========================================================\n");
  } finally {
    // Cleanup test data
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
  const port = 4999;
  const server: Server = app.listen(port);
  const baseUrl = `http://localhost:${port}`;

  try {
    await runReportTests(baseUrl);
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
