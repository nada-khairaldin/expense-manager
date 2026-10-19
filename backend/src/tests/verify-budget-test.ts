import {
  calculateCycleDateRange,
  getRenewalDateForMonth,
  resolveBudgetCycle,
  toUTCDateOnly,
} from "../services/budget-cycle.service.js";
import { prisma } from "../lib/prisma.js";
import app from "../app.js";
import type { Server } from "http";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function formatDate(d: Date): string {
  const parts = d.toISOString().split("T");
  return parts[0] ?? "";
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    currency: string;
    budgetRenewalDay: number;
    defaultBudgetAmount: number | null;
    budgetSetupCompleted: boolean;
    settings?: {
      id: string;
      currency: string;
      budgetRenewalDay: number;
      defaultBudgetAmount: number | null;
      budgetSetupCompleted: boolean;
    };
  };
  token: string;
}

interface MeResponse {
  id: string;
  name: string;
  email: string;
  currency: string;
  budgetRenewalDay: number;
  defaultBudgetAmount: number | null;
  budgetSetupCompleted: boolean;
}

interface SettingsResponse {
  id: string;
  userId: string;
  currency: string;
  budgetRenewalDay: number;
  defaultBudgetAmount: number | null;
  budgetSetupCompleted: boolean;
}

interface BudgetCycleResponse {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  totalExpenses: number;
  remainingBudget: number;
  percentageUsed: number;
  isCompleted: boolean;
}

async function runUnitTests() {
  console.log("\n--- 1. Testing Budget Cycle Calculations (Days 28-31, Leap Years, Year Transitions) ---");

  // A. Clamping for day 31 in shorter months
  // Leap year 2024 (Feb has 29 days)
  const feb2024Renewal = getRenewalDateForMonth(2024, 1, 31);
  assert(formatDate(feb2024Renewal) === "2024-02-29", `Expected 2024-02-29, got ${formatDate(feb2024Renewal)}`);

  // Non-leap year 2023 (Feb has 28 days)
  const feb2023Renewal = getRenewalDateForMonth(2023, 1, 31);
  assert(formatDate(feb2023Renewal) === "2023-02-28", `Expected 2023-02-28, got ${formatDate(feb2023Renewal)}`);

  // April 2024 (30 days)
  const apr2024Renewal = getRenewalDateForMonth(2024, 3, 31);
  assert(formatDate(apr2024Renewal) === "2024-04-30", `Expected 2024-04-30, got ${formatDate(apr2024Renewal)}`);

  // B. Cycle date ranges for day 31
  // Jan 31 in leap year 2024: cycle should run 2024-01-31 to 2024-02-28
  const janCycle = calculateCycleDateRange(new Date("2024-01-31T00:00:00Z"), 31);
  assert(formatDate(janCycle.startDate) === "2024-01-31", `Jan cycle start expected 2024-01-31, got ${formatDate(janCycle.startDate)}`);
  assert(formatDate(janCycle.endDate) === "2024-02-28", `Jan cycle end expected 2024-02-28, got ${formatDate(janCycle.endDate)}`);

  // Feb 29 in leap year 2024: cycle should run 2024-02-29 to 2024-03-30
  const febCycleLeap = calculateCycleDateRange(new Date("2024-02-29T00:00:00Z"), 31);
  assert(formatDate(febCycleLeap.startDate) === "2024-02-29", `Feb leap start expected 2024-02-29, got ${formatDate(febCycleLeap.startDate)}`);
  assert(formatDate(febCycleLeap.endDate) === "2024-03-30", `Feb leap end expected 2024-03-30, got ${formatDate(febCycleLeap.endDate)}`);

  // Contiguity check: Jan end (Feb 28) + 1 day = Feb start (Feb 29)
  const janEndPlusOne = new Date(janCycle.endDate.getTime() + 24 * 60 * 60 * 1000);
  assert(formatDate(janEndPlusOne) === formatDate(febCycleLeap.startDate), "Jan cycle and Feb cycle must be contiguous!");

  // Non-leap year 2023 Feb 28 with renewal day 31: cycle should run 2023-02-28 to 2023-03-30
  const febCycleNonLeap = calculateCycleDateRange(new Date("2023-02-28T00:00:00Z"), 31);
  assert(formatDate(febCycleNonLeap.startDate) === "2023-02-28", `Feb non-leap start expected 2023-02-28, got ${formatDate(febCycleNonLeap.startDate)}`);
  assert(formatDate(febCycleNonLeap.endDate) === "2023-03-30", `Feb non-leap end expected 2023-03-30, got ${formatDate(febCycleNonLeap.endDate)}`);

  // March 31 with renewal day 31: cycle should run 2024-03-31 to 2024-04-29
  const marCycle = calculateCycleDateRange(new Date("2024-03-31T00:00:00Z"), 31);
  assert(formatDate(marCycle.startDate) === "2024-03-31", `Mar start expected 2024-03-31, got ${formatDate(marCycle.startDate)}`);
  assert(formatDate(marCycle.endDate) === "2024-04-29", `Mar end expected 2024-04-29, got ${formatDate(marCycle.endDate)}`);

  // April 30 with renewal day 31: cycle should run 2024-04-30 to 2024-05-30
  const aprCycle = calculateCycleDateRange(new Date("2024-04-30T00:00:00Z"), 31);
  assert(formatDate(aprCycle.startDate) === "2024-04-30", `Apr start expected 2024-04-30, got ${formatDate(aprCycle.startDate)}`);
  assert(formatDate(aprCycle.endDate) === "2024-05-30", `Apr end expected 2024-05-30, got ${formatDate(aprCycle.endDate)}`);

  console.log("✓ All unit tests for budget cycle calculations passed!");
}

async function runApiIntegrationTests(baseUrl: string) {
  console.log("\n--- 2. Testing API Endpoints (Auth, Settings, Validation, Persistence) ---");

  const testEmailA = `test-user-a-${Date.now()}@example.com`;
  const testEmailB = `test-user-b-${Date.now()}@example.com`;

  // 1. Unauthenticated PUT /settings/budget-setup -> 401
  const unauthRes = await fetch(`${baseUrl}/settings/budget-setup`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currency: "ILS", budgetRenewalDay: 1, defaultBudgetAmount: 5000 }),
  });
  assert(unauthRes.status === 401, `Expected 401 for unauthenticated request, got ${unauthRes.status}`);
  console.log("✓ Unauthenticated access correctly rejected with 401");

  // 2. Register user A
  const regResA = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "User Alpha",
      email: testEmailA,
      password: "password123",
    }),
  });
  assert(regResA.status === 201, `Expected 201 for register, got ${regResA.status}`);
  const regDataA = (await regResA.json()) as AuthResponse;
  const tokenA = regDataA.token;
  const userIdA = regDataA.user.id;

  assert(regDataA.user.budgetSetupCompleted === false, `New user budgetSetupCompleted should be false, got ${String(regDataA.user.budgetSetupCompleted)}`);
  assert(regDataA.user.currency === "ILS", `New user currency should default to ILS, got ${regDataA.user.currency}`);
  assert(regDataA.user.budgetRenewalDay === 1, `New user budgetRenewalDay should default to 1, got ${String(regDataA.user.budgetRenewalDay)}`);
  assert(regDataA.user.defaultBudgetAmount === null, `New user defaultBudgetAmount must be null (not invented), got ${String(regDataA.user.defaultBudgetAmount)}`);
  console.log("✓ Registration returns default settings with budgetSetupCompleted = false and defaultBudgetAmount = null");

  // 3. GET /auth/me for User A
  const meResA = await fetch(`${baseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(meResA.status === 200, `Expected 200 for /auth/me, got ${meResA.status}`);
  const meDataA = (await meResA.json()) as MeResponse;
  assert(meDataA.budgetSetupCompleted === false, "GET /auth/me must return budgetSetupCompleted: false");
  assert(meDataA.defaultBudgetAmount === null, "GET /auth/me must return defaultBudgetAmount: null");
  console.log("✓ GET /auth/me exposes budgetSetupCompleted, currency, and defaultBudgetAmount (null)");

  // 4. Test missing default budget safety check: Attempting to resolve cycle before budget setup fails
  let cycleCreationThrew = false;
  try {
    await resolveBudgetCycle(userIdA, new Date("2024-04-10T00:00:00Z"));
  } catch (err) {
    cycleCreationThrew = true;
    const errorWithStatus = err as { statusCode?: number };
    assert(errorWithStatus.statusCode === 400, `Expected 400 for cycle creation without default budget, got ${errorWithStatus.statusCode}`);
  }
  assert(cycleCreationThrew, "resolveBudgetCycle must throw error when user has not configured default budget");
  console.log("✓ Safe missing budget handling: does not silently use zero for missing default budget");

  // 5. Invalid defaultBudgetAmount validation
  const invalidNegativeBudgetRes = await fetch(`${baseUrl}/settings/budget-setup`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ currency: "USD", budgetRenewalDay: 15, defaultBudgetAmount: -500 }),
  });
  assert(invalidNegativeBudgetRes.status === 400, `Expected 400 for negative defaultBudgetAmount, got ${invalidNegativeBudgetRes.status}`);

  const invalidZeroBudgetRes = await fetch(`${baseUrl}/settings/budget-setup`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ currency: "USD", budgetRenewalDay: 15, defaultBudgetAmount: 0 }),
  });
  assert(invalidZeroBudgetRes.status === 400, `Expected 400 for zero defaultBudgetAmount, got ${invalidZeroBudgetRes.status}`);
  console.log("✓ Validation rejects non-positive defaultBudgetAmount");

  // 6. Successful PUT /settings/budget-setup with defaultBudgetAmount: 5000
  const validUpdateRes = await fetch(`${baseUrl}/settings/budget-setup`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ currency: "USD", budgetRenewalDay: 31, defaultBudgetAmount: 5000 }),
  });
  assert(validUpdateRes.status === 200, `Expected 200 for valid settings update, got ${validUpdateRes.status}`);
  const updateData = (await validUpdateRes.json()) as SettingsResponse;
  assert(updateData.currency === "USD", `Updated currency expected USD, got ${updateData.currency}`);
  assert(updateData.budgetRenewalDay === 31, `Updated budgetRenewalDay expected 31, got ${String(updateData.budgetRenewalDay)}`);
  assert(updateData.defaultBudgetAmount === 5000, `Updated defaultBudgetAmount expected 5000, got ${String(updateData.defaultBudgetAmount)}`);
  assert(updateData.budgetSetupCompleted === true, `Updated budgetSetupCompleted expected true, got ${String(updateData.budgetSetupCompleted)}`);
  console.log("✓ PUT /settings/budget-setup successfully persists settings with defaultBudgetAmount");

  // 7. Verify subsequent GET /auth/me reflects completion and defaultBudgetAmount
  const meResAfter = await fetch(`${baseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const meDataAfter = (await meResAfter.json()) as MeResponse;
  assert(meDataAfter.budgetSetupCompleted === true, "GET /auth/me should now return budgetSetupCompleted: true");
  assert(meDataAfter.defaultBudgetAmount === 5000, `GET /auth/me should return defaultBudgetAmount: 5000, got ${String(meDataAfter.defaultBudgetAmount)}`);
  console.log("✓ Subsequent GET /auth/me reflects defaultBudgetAmount: 5000");

  // 8. Register User B (Multi-user isolation)
  const regResB = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "User Beta",
      email: testEmailB,
      password: "password123",
    }),
  });
  const regDataB = (await regResB.json()) as AuthResponse;
  const tokenB = regDataB.token;
  assert(regDataB.user.budgetSetupCompleted === false, "User B setup must still be false");
  assert(regDataB.user.defaultBudgetAmount === null, "User B default budget must still be null");
  console.log("✓ User settings isolation verified (User B unaffected by User A)");

  console.log("\n--- 3. Testing Budget Cycle Creation & Default Inheritance ---");

  // A. Create cycle for current date -> must inherit defaultBudgetAmount (5000)
  const today = toUTCDateOnly(new Date());
  const activeCycle = await resolveBudgetCycle(userIdA, today);
  assert(Number(activeCycle.budgetAmount) === 5000, `Active cycle budget expected 5000, got ${activeCycle.budgetAmount}`);
  console.log(`✓ Active cycle created with budgetAmount initialized from defaultBudgetAmount (${activeCycle.budgetAmount})`);

  // B. Calling resolveBudgetCycle again for the same date reuses cycle without overwriting
  const reusedCycle = await resolveBudgetCycle(userIdA, today);
  assert(reusedCycle.id === activeCycle.id, "Existing cycle covering date must be reused");
  assert(Number(reusedCycle.budgetAmount) === 5000, "Reused cycle must preserve its saved budgetAmount");
  console.log("✓ Existing cycle reused without overwriting saved budget");

  // C. GET /budget-cycles/current endpoint
  const getCurrentCycleRes = await fetch(`${baseUrl}/budget-cycles/current`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(getCurrentCycleRes.status === 200, `Expected 200 for GET /budget-cycles/current, got ${getCurrentCycleRes.status}`);
  const currentCycleData = (await getCurrentCycleRes.json()) as BudgetCycleResponse;
  assert(currentCycleData.id === activeCycle.id, "GET /budget-cycles/current returned correct active cycle");
  assert(currentCycleData.budgetAmount === 5000, "GET /budget-cycles/current budgetAmount is 5000");
  console.log("✓ GET /budget-cycles/current returns active cycle with correct budget");

  console.log("\n--- 4. Testing Updating Default Budget (Syncs Active Cycle & Future Cycles) ---");

  // Create a past cycle manually to verify completed cycles are NOT touched when default changes
  const pastCycleStart = new Date("2023-01-01T00:00:00Z");
  const pastCycleEnd = new Date("2023-01-30T00:00:00Z");
  const pastCycle = await prisma.budgetCycle.create({
    data: {
      userId: userIdA,
      startDate: pastCycleStart,
      endDate: pastCycleEnd,
      budgetAmount: 3000,
    },
  });

  // User A updates default budget to 8000 via PATCH /settings/default-budget
  const updateDefaultRes = await fetch(`${baseUrl}/settings/default-budget`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ defaultBudgetAmount: 8000 }),
  });
  assert(updateDefaultRes.status === 200, `Expected 200 for PATCH /settings/default-budget, got ${updateDefaultRes.status}`);
  const updatedSettingsData = (await updateDefaultRes.json()) as SettingsResponse;
  assert(updatedSettingsData.defaultBudgetAmount === 8000, "defaultBudgetAmount must be updated to 8000");

  // Verify Active Cycle budget was immediately updated to 8000
  const refreshedActiveCycle = await prisma.budgetCycle.findUnique({
    where: { id: activeCycle.id },
  });
  assert(Number(refreshedActiveCycle?.budgetAmount) === 8000, `Active cycle budget should be immediately updated to 8000, got ${refreshedActiveCycle?.budgetAmount}`);
  console.log("✓ Updating default budget immediately updated the active cycle's budgetAmount to 8000");

  // Verify Completed Cycle budget was NOT changed (remains 3000)
  const refreshedPastCycle = await prisma.budgetCycle.findUnique({
    where: { id: pastCycle.id },
  });
  assert(Number(refreshedPastCycle?.budgetAmount) === 3000, `Completed past cycle budget must remain 3000, got ${refreshedPastCycle?.budgetAmount}`);
  console.log("✓ Completed cycles outside current active cycle were NOT changed");

  // Verify future cycle creation inherits the new default (8000)
  const futureDate = new Date("2028-06-15T00:00:00Z");
  const futureCycle = await resolveBudgetCycle(userIdA, futureDate);
  assert(Number(futureCycle.budgetAmount) === 8000, `Future cycle should inherit new default 8000, got ${futureCycle.budgetAmount}`);
  console.log("✓ Future cycle created inherits new defaultBudgetAmount (8000)");

  console.log("\n--- 5. Testing Independent Current Cycle Edits ---");

  // Edit current cycle independently to 9500 via PATCH /budget-cycles/current
  const patchCycleRes = await fetch(`${baseUrl}/budget-cycles/current`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ budgetAmount: 9500 }),
  });
  assert(patchCycleRes.status === 200, `Expected 200 for PATCH /budget-cycles/current, got ${patchCycleRes.status}`);
  const patchedCycleData = (await patchCycleRes.json()) as BudgetCycleResponse;
  assert(patchedCycleData.budgetAmount === 9500, `Patched cycle budget should be 9500, got ${patchedCycleData.budgetAmount}`);

  // Verify defaultBudgetAmount in UserSettings was NOT changed (must still be 8000)
  const settingsCheck = await prisma.userSettings.findUnique({ where: { userId: userIdA } });
  assert(Number(settingsCheck?.defaultBudgetAmount) === 8000, `defaultBudgetAmount must remain 8000, got ${settingsCheck?.defaultBudgetAmount}`);
  console.log("✓ Editing active cycle updated ONLY that cycle and did not change defaultBudgetAmount");

  // Verify future cycle was not affected
  const refreshedFuture = await prisma.budgetCycle.findUnique({ where: { id: futureCycle.id } });
  assert(Number(refreshedFuture?.budgetAmount) === 8000, "Future cycle was not changed by current cycle edit");
  console.log("✓ Other cycles were not changed by current cycle edit");

  // Reject editing completed cycle via PATCH /budget-cycles/:id
  const editCompletedRes = await fetch(`${baseUrl}/budget-cycles/${pastCycle.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ budgetAmount: 9999 }),
  });
  assert(editCompletedRes.status === 400, `Expected 400 when attempting to edit completed cycle, got ${editCompletedRes.status}`);
  console.log("✓ Backend strictly rejects attempts to edit completed cycle");

  // Reject editing another user's cycle
  const editUnauthorizedRes = await fetch(`${baseUrl}/budget-cycles/${activeCycle.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenB}`,
    },
    body: JSON.stringify({ budgetAmount: 1111 }),
  });
  assert(editUnauthorizedRes.status === 404, `Expected 404 when User B tries to edit User A cycle, got ${editUnauthorizedRes.status}`);
  console.log("✓ Cycle edit enforces user ownership");

  // Verify expenses preserved when budget changes
  const testExpense = await prisma.expense.create({
    data: {
      userId: userIdA,
      budgetCycleId: activeCycle.id,
      categoryNameSnapshot: "طعام",
      amount: 250,
      expenseDate: today,
    },
  });

  // Update active cycle budget again
  await fetch(`${baseUrl}/budget-cycles/current`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ budgetAmount: 9800 }),
  });

  const expenseCheck = await prisma.expense.findUnique({ where: { id: testExpense.id } });
  assert(expenseCheck !== null, "Existing expenses must be preserved when cycle budget changes");
  assert(Number(expenseCheck?.amount) === 250, "Expense amount must remain unchanged");
  console.log("✓ All existing expenses preserved when budget amount changes");

  console.log("\n--- 6. Testing Concurrent Requests Handling ---");
  const concurrentDate = new Date("2029-01-10T00:00:00Z");
  const concurrentResults = await Promise.all([
    resolveBudgetCycle(userIdA, concurrentDate),
    resolveBudgetCycle(userIdA, concurrentDate),
    resolveBudgetCycle(userIdA, concurrentDate),
    resolveBudgetCycle(userIdA, concurrentDate),
  ]);

  const firstId = concurrentResults[0]?.id;
  for (const res of concurrentResults) {
    assert(res.id === firstId, "All concurrent requests must resolve to the identical budget cycle record");
  }
  const countForDate = await prisma.budgetCycle.count({
    where: {
      userId: userIdA,
      startDate: concurrentResults[0]?.startDate,
    },
  });
  assert(countForDate === 1, `Expected exactly 1 cycle created despite concurrent calls, got ${countForDate}`);
  console.log("✓ Concurrency test passed: safe handling without duplicate records or key errors");

  // Cleanup test users and cycles
  await prisma.expense.deleteMany({ where: { userId: { in: [userIdA, regDataB.user.id] } } });
  await prisma.budgetCycle.deleteMany({ where: { userId: { in: [userIdA, regDataB.user.id] } } });
  await prisma.user.deleteMany({
    where: { email: { in: [testEmailA, testEmailB] } },
  });
  console.log("✓ Cleaned up test records safely");
}

async function main() {
  let server: Server | null = null;
  try {
    await runUnitTests();

    // Start a temporary test server on an ephemeral port bound to 127.0.0.1
    const testPort = 5557;
    server = await new Promise<Server>((resolve) => {
      const s = app.listen(testPort, "127.0.0.1", () => resolve(s));
    });
    const baseUrl = `http://127.0.0.1:${testPort}`;

    await runApiIntegrationTests(baseUrl);

    console.log("\n==========================================");
    console.log("🎉 ALL TESTS & CHECKS PASSED SUCCESSFULLY!");
    console.log("==========================================\n");
  } catch (error) {
    console.error("\n❌ Verification failed:", error);
    process.exit(1);
  } finally {
    if (server) {
      (server as Server).close();
    }
    await prisma.$disconnect();
  }
}

main();
