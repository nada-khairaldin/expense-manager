import {
  calculateCycleDateRange,
  getRenewalDateForMonth,
  resolveBudgetCycle,
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
    budgetSetupCompleted: boolean;
    settings?: {
      id: string;
      currency: string;
      budgetRenewalDay: number;
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
  budgetSetupCompleted: boolean;
}

interface SettingsResponse {
  id: string;
  userId: string;
  currency: string;
  budgetRenewalDay: number;
  budgetSetupCompleted: boolean;
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

  // C. Boundaries for Renewal Days 28, 29, 30
  // Day 30 in non-leap Feb 2023:
  const day30Feb = calculateCycleDateRange(new Date("2023-02-28T00:00:00Z"), 30);
  assert(formatDate(day30Feb.startDate) === "2023-02-28", `Day 30 Feb start expected 2023-02-28, got ${formatDate(day30Feb.startDate)}`);
  assert(formatDate(day30Feb.endDate) === "2023-03-29", `Day 30 Feb end expected 2023-03-29, got ${formatDate(day30Feb.endDate)}`);

  // Day 29 in non-leap Feb 2023:
  const day29Feb = calculateCycleDateRange(new Date("2023-02-28T00:00:00Z"), 29);
  assert(formatDate(day29Feb.startDate) === "2023-02-28", `Day 29 Feb start expected 2023-02-28, got ${formatDate(day29Feb.startDate)}`);
  assert(formatDate(day29Feb.endDate) === "2023-03-28", `Day 29 Feb end expected 2023-03-28, got ${formatDate(day29Feb.endDate)}`);

  // Day 28 in non-leap Feb 2023:
  const day28Feb = calculateCycleDateRange(new Date("2023-02-28T00:00:00Z"), 28);
  assert(formatDate(day28Feb.startDate) === "2023-02-28", `Day 28 Feb start expected 2023-02-28, got ${formatDate(day28Feb.startDate)}`);
  assert(formatDate(day28Feb.endDate) === "2023-03-27", `Day 28 Feb end expected 2023-03-27, got ${formatDate(day28Feb.endDate)}`);

  // D. Year transition check
  // Dec 31, 2024 with renewal day 31: cycle runs 2024-12-31 to 2025-01-30
  const yearTransitionCycle = calculateCycleDateRange(new Date("2024-12-31T00:00:00Z"), 31);
  assert(formatDate(yearTransitionCycle.startDate) === "2024-12-31", `Year transition start expected 2024-12-31, got ${formatDate(yearTransitionCycle.startDate)}`);
  assert(formatDate(yearTransitionCycle.endDate) === "2025-01-30", `Year transition end expected 2025-01-30, got ${formatDate(yearTransitionCycle.endDate)}`);

  // Jan 15, 2025 with renewal day 31 falls into the 2024-12-31 to 2025-01-30 cycle
  const jan15Cycle = calculateCycleDateRange(new Date("2025-01-15T00:00:00Z"), 31);
  assert(formatDate(jan15Cycle.startDate) === "2024-12-31", `Jan 15 cycle start expected 2024-12-31, got ${formatDate(jan15Cycle.startDate)}`);
  assert(formatDate(jan15Cycle.endDate) === "2025-01-30", `Jan 15 cycle end expected 2025-01-30, got ${formatDate(jan15Cycle.endDate)}`);

  // E. Renewal date membership: expense on renewal date belongs to the NEW cycle
  // Renewal day = 15:
  // Expense on 2024-05-14 -> old cycle (2024-04-15 to 2024-05-14)
  const prevCycle = calculateCycleDateRange(new Date("2024-05-14T00:00:00Z"), 15);
  assert(formatDate(prevCycle.startDate) === "2024-04-15" && formatDate(prevCycle.endDate) === "2024-05-14", "2024-05-14 should belong to April-May cycle");

  // Expense on 2024-05-15 -> new cycle (2024-05-15 to 2024-06-14)
  const newCycle = calculateCycleDateRange(new Date("2024-05-15T00:00:00Z"), 15);
  assert(formatDate(newCycle.startDate) === "2024-05-15" && formatDate(newCycle.endDate) === "2024-06-14", "2024-05-15 should belong to May-June cycle");

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
    body: JSON.stringify({ currency: "ILS", budgetRenewalDay: 1 }),
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

  assert(regDataA.user.budgetSetupCompleted === false, `New user budgetSetupCompleted should be false, got ${String(regDataA.user.budgetSetupCompleted)}`);
  assert(regDataA.user.currency === "ILS", `New user currency should default to ILS, got ${regDataA.user.currency}`);
  assert(regDataA.user.budgetRenewalDay === 1, `New user budgetRenewalDay should default to 1, got ${String(regDataA.user.budgetRenewalDay)}`);
  console.log("✓ Registration returns default settings with budgetSetupCompleted = false");

  // 3. GET /auth/me for User A
  const meResA = await fetch(`${baseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(meResA.status === 200, `Expected 200 for /auth/me, got ${meResA.status}`);
  const meDataA = (await meResA.json()) as MeResponse;
  assert(meDataA.budgetSetupCompleted === false, "GET /auth/me must return budgetSetupCompleted: false");
  assert(meDataA.currency === "ILS", "GET /auth/me must return currency: ILS");
  assert(meDataA.budgetRenewalDay === 1, "GET /auth/me must return budgetRenewalDay: 1");
  console.log("✓ GET /auth/me exposes budgetSetupCompleted, currency, and budgetRenewalDay");

  // 4. Invalid currency validation
  const invalidCurrencyRes = await fetch(`${baseUrl}/settings/budget-setup`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ currency: "GBP", budgetRenewalDay: 15 }),
  });
  assert(invalidCurrencyRes.status === 400, `Expected 400 for invalid currency GBP, got ${invalidCurrencyRes.status}`);

  // 5. Invalid renewal day validation (0 and 32 and non-integer)
  const invalidDayZeroRes = await fetch(`${baseUrl}/settings/budget-setup`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ currency: "USD", budgetRenewalDay: 0 }),
  });
  assert(invalidDayZeroRes.status === 400, `Expected 400 for renewal day 0, got ${invalidDayZeroRes.status}`);

  const invalidDay32Res = await fetch(`${baseUrl}/settings/budget-setup`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ currency: "USD", budgetRenewalDay: 32 }),
  });
  assert(invalidDay32Res.status === 400, `Expected 400 for renewal day 32, got ${invalidDay32Res.status}`);

  const invalidDayFloatRes = await fetch(`${baseUrl}/settings/budget-setup`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ currency: "USD", budgetRenewalDay: 15.5 }),
  });
  assert(invalidDayFloatRes.status === 400, `Expected 400 for renewal day 15.5, got ${invalidDayFloatRes.status}`);
  console.log("✓ Validation rejects invalid currencies and out-of-range/non-integer renewal days");

  // 6. Successful PUT /settings/budget-setup
  const validUpdateRes = await fetch(`${baseUrl}/settings/budget-setup`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ currency: "USD", budgetRenewalDay: 31 }),
  });
  assert(validUpdateRes.status === 200, `Expected 200 for valid settings update, got ${validUpdateRes.status}`);
  const updateData = (await validUpdateRes.json()) as SettingsResponse;
  assert(updateData.currency === "USD", `Updated currency expected USD, got ${updateData.currency}`);
  assert(updateData.budgetRenewalDay === 31, `Updated budgetRenewalDay expected 31, got ${String(updateData.budgetRenewalDay)}`);
  assert(updateData.budgetSetupCompleted === true, `Updated budgetSetupCompleted expected true, got ${String(updateData.budgetSetupCompleted)}`);
  console.log("✓ PUT /settings/budget-setup successfully persists settings and marks setup completed");

  // 7. Verify subsequent GET /auth/me reflects completion and new settings
  const meResAfter = await fetch(`${baseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const meDataAfter = (await meResAfter.json()) as MeResponse;
  assert(meDataAfter.budgetSetupCompleted === true, "GET /auth/me should now return budgetSetupCompleted: true");
  assert(meDataAfter.currency === "USD", "GET /auth/me should return currency: USD");
  assert(meDataAfter.budgetRenewalDay === 31, "GET /auth/me should return budgetRenewalDay: 31");
  console.log("✓ Subsequent GET /auth/me reflects completed setup and updated values");

  // 8. Ensure no duplicate UserSettings records exist in database
  const settingsCount = await prisma.userSettings.count({
    where: { userId: meDataAfter.id },
  });
  assert(settingsCount === 1, `Expected exactly 1 UserSettings record for user, found ${settingsCount}`);
  console.log("✓ Verified no duplicate UserSettings records exist");

  // 9. Multi-user isolation test
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
  assert(regDataB.user.budgetSetupCompleted === false, "User B setup must still be false");
  assert(regDataB.user.currency === "ILS", "User B currency must still be ILS");
  console.log("✓ User settings isolation verified (User B unaffected by User A)");

  // 10. Test historical cycle preservation when settings change
  const userIdA = meDataAfter.id;
  // Create an expense with budget cycle when renewal day was 31
  const cyclePreChange = await resolveBudgetCycle(userIdA, new Date("2024-04-10T00:00:00Z"));
  const cycleIdOriginal = cyclePreChange.id;

  // Now change user A renewal day to 15
  await fetch(`${baseUrl}/settings/budget-setup`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ currency: "JOD", budgetRenewalDay: 15 }),
  });

  // Re-resolving for the same historical date must return the original cycle
  const cyclePostChange = await resolveBudgetCycle(userIdA, new Date("2024-04-10T00:00:00Z"));
  assert(cyclePostChange.id === cycleIdOriginal, "Historical budget cycle must be preserved when user settings change");
  console.log("✓ Historical budget cycle preservation verified");

  // Cleanup test users
  await prisma.user.deleteMany({
    where: { email: { in: [testEmailA, testEmailB] } },
  });
  console.log("✓ Cleaned up test records safely");
}

async function main() {
  let server: Server | null = null;
  try {
    await runUnitTests();

    // Start a temporary test server on an ephemeral port
    const testPort = 5555;
    server = app.listen(testPort);
    const baseUrl = `http://localhost:${testPort}`;

    await runApiIntegrationTests(baseUrl);

    console.log("\n==========================================");
    console.log("🎉 ALL TESTS & CHECKS PASSED SUCCESSFULLY!");
    console.log("==========================================\n");
  } catch (error) {
    console.error("\n❌ Verification failed:", error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }
}

main();
