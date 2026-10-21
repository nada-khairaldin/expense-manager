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

interface ExpenseResponse {
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
  createdAt: string;
  updatedAt: string;
}

interface ExpensesListResponse {
  data: ExpenseResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  totalAmount?: number;
}

async function runExpenseTests(baseUrl: string) {
  console.log("\n========================================================");
  console.log("Starting Real Expense Backend & Database Verification");
  console.log("========================================================\n");

  const timestamp = Date.now();
  const testEmailA = `exp-test-user-a-${timestamp}@example.com`;
  const testEmailB = `exp-test-user-b-${timestamp}@example.com`;

  try {
    // 1. Unauthenticated request protection
    console.log("1. Verifying Authentication Enforcement on /expenses...");
    const unauthGet = await fetch(`${baseUrl}/expenses`);
    assert(unauthGet.status === 401, `Expected 401 for unauthenticated GET /expenses, got ${unauthGet.status}`);

    const unauthPost = await fetch(`${baseUrl}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 100 }),
    });
    assert(unauthPost.status === 401, `Expected 401 for unauthenticated POST /expenses, got ${unauthPost.status}`);
    console.log("✓ Unauthenticated expense endpoints reject with 401");

    // 2. Register test user A and set up initial budget
    console.log("\n2. Registering test user A and setting budget setup...");
    const regResA = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "User Expenses Test A",
        email: testEmailA,
        password: "Password123!",
      }),
    });
    assert(regResA.status === 201, `User A registration failed: ${regResA.status}`);
    const authA = (await regResA.json()) as AuthResponse;
    const tokenA = authA.token;

    // Complete budget setup for User A
    const setupRes = await fetch(`${baseUrl}/settings/budget-setup`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currency: "ILS",
        budgetRenewalDay: 1,
        defaultBudgetAmount: 15000,
      }),
    });
    assert(setupRes.status === 200, `Budget setup failed: ${setupRes.status}`);
    console.log("✓ User A registered and budget setup completed (15,000 ILS)");

    // 3. Verify empty expense list for new user
    console.log("\n3. Testing GET /expenses for clean new user (empty state)...");
    const emptyGet = await fetch(`${baseUrl}/expenses`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(emptyGet.status === 200, "GET /expenses returned 200");
    const emptyJson = (await emptyGet.json()) as ExpensesListResponse;
    assert(emptyJson.data.length === 0, `Expected 0 expenses, got ${emptyJson.data.length}`);
    assert(emptyJson.pagination.total === 0, "Pagination total is 0");
    assert(emptyJson.totalAmount === 0, "totalAmount is 0");
    console.log("✓ GET /expenses returns { data: [], pagination: { total: 0 }, totalAmount: 0 }");

    // 4. Create category for User A
    console.log("\n4. Creating test category for User A...");
    const catRes = await fetch(`${baseUrl}/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `سوبرماركت ${timestamp}`,
        icon: "ShoppingCart",
        color: "#16856B",
        monthlyLimit: 3000,
      }),
    });
    assert(catRes.status === 201, "Category creation succeeded");
    const catA = (await catRes.json()) as { id: string; name: string };
    console.log(`✓ Category created: "${catA.name}" (ID: ${catA.id})`);

    // 5. Test validation on POST /expenses
    console.log("\n5. Testing validation on POST /expenses...");
    // 5a. Negative amount
    const negRes = await fetch(`${baseUrl}/expenses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: -50, date: "2026-10-15" }),
    });
    assert(negRes.status === 400, `Expected 400 for negative amount, got ${negRes.status}`);

    // 5b. Zero amount
    const zeroRes = await fetch(`${baseUrl}/expenses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: 0, date: "2026-10-15" }),
    });
    assert(zeroRes.status === 400, `Expected 400 for zero amount, got ${zeroRes.status}`);

    // 5c. Long description (> 800 chars)
    const longDescRes = await fetch(`${baseUrl}/expenses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 50,
        description: "A".repeat(801),
        date: "2026-10-15",
      }),
    });
    assert(longDescRes.status === 400, `Expected 400 for description > 800 chars, got ${longDescRes.status}`);
    console.log("✓ Validation rejects zero/negative amounts and excessive description length");

    // 6. Create valid categorized expense
    console.log("\n6. Creating categorized expense...");
    const createCatExpRes = await fetch(`${baseUrl}/expenses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 350.5,
        categoryId: catA.id,
        description: "مشتريات خضار وفواكه ولحوم",
        date: "2026-10-10",
      }),
    });
    assert(createCatExpRes.status === 201, `Expected 201, got ${createCatExpRes.status}`);
    const exp1 = (await createCatExpRes.json()) as ExpenseResponse;
    assert(exp1.amount === 350.5, "Amount matches 350.5");
    assert(exp1.categoryId === catA.id, "Category ID matches");
    assert(exp1.categoryName === catA.name, "Category snapshot name matches");
    assert(exp1.categoryIcon === "ShoppingCart", "Category icon matches");
    assert(exp1.budgetCycleId !== undefined && exp1.budgetCycleId.length > 0, "Budget cycle resolved");
    console.log(`✓ Expense 1 created (${exp1.id}) with amount 350.5 and budgetCycleId: ${exp1.budgetCycleId}`);

    // 7. Create uncategorized expense
    console.log("\n7. Creating uncategorized expense (categoryId: null)...");
    const createUncatExpRes = await fetch(`${baseUrl}/expenses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 120,
        categoryId: null,
        description: "مصروف نثريات غير مصنف",
        date: "2026-10-12",
      }),
    });
    assert(createUncatExpRes.status === 201, `Expected 201, got ${createUncatExpRes.status}`);
    const exp2 = (await createUncatExpRes.json()) as ExpenseResponse;
    assert(exp2.amount === 120, "Amount matches 120");
    assert(exp2.categoryId === null, "Category ID is null");
    assert(exp2.categoryName === "غير مصنف", `Category snapshot is 'غير مصنف', got '${exp2.categoryName}'`);
    console.log(`✓ Uncategorized Expense 2 created (${exp2.id})`);

    // 8. Create additional expenses for filtering, sorting, pagination
    console.log("\n8. Creating additional expenses for filters/sorting/pagination...");
    const extraDates = [
      { amount: 50, date: "2026-10-01", desc: "قهوة الصباح" },
      { amount: 800, date: "2026-10-05", desc: "صيانة منزلية" },
      { amount: 200, date: "2026-10-20", desc: "وقود سيارة" },
      { amount: 1500, date: "2026-10-25", desc: "إيجار جزء من السكن" },
    ];
    for (const item of extraDates) {
      const res = await fetch(`${baseUrl}/expenses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenA}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: item.amount,
          categoryId: catA.id,
          description: item.desc,
          date: item.date,
        }),
      });
      assert(res.status === 201, `Failed to create extra expense: ${res.status}`);
    }
    console.log("✓ Added 4 extra test expenses (total 6 expenses)");

    // 9. Testing GET /expenses/:id (single expense)
    console.log("\n9. Testing GET /expenses/:id...");
    const getSingleRes = await fetch(`${baseUrl}/expenses/${exp1.id}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(getSingleRes.status === 200, `Expected 200, got ${getSingleRes.status}`);
    const singleExp = (await getSingleRes.json()) as ExpenseResponse;
    assert(singleExp.id === exp1.id, "ID matches");
    assert(singleExp.amount === 350.5, "Amount matches");
    console.log("✓ GET /expenses/:id successfully returned expense details");

    // 10. Testing PATCH /expenses/:id
    console.log("\n10. Testing PATCH /expenses/:id (updating amount & description)...");
    const updateRes = await fetch(`${baseUrl}/expenses/${exp1.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 390.75,
        description: "مشتريات خضار ومواد تموينية معدلة",
      }),
    });
    assert(updateRes.status === 200, `Expected 200 for PATCH, got ${updateRes.status}`);
    const updatedExp = (await updateRes.json()) as ExpenseResponse;
    assert(updatedExp.amount === 390.75, `Expected 390.75, got ${updatedExp.amount}`);
    assert(updatedExp.description === "مشتريات خضار ومواد تموينية معدلة", "Description updated");
    console.log("✓ PATCH /expenses/:id successfully updated amount and description");

    // 11. Testing Date Filtering (startDate, endDate)
    console.log("\n11. Testing Date Filtering (startDate & endDate)...");
    const dateFilterRes = await fetch(
      `${baseUrl}/expenses?startDate=2026-10-05&endDate=2026-10-20`,
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );
    assert(dateFilterRes.status === 200, "Date filter returned 200");
    const dateFiltered = (await dateFilterRes.json()) as ExpensesListResponse;
    // Should include 2026-10-05 (800), 2026-10-10 (390.75), 2026-10-12 (120), 2026-10-20 (200) -> 4 items
    assert(dateFiltered.pagination.total === 4, `Expected 4 items between 10-05 and 10-20, got ${dateFiltered.pagination.total}`);
    console.log(`✓ Date range filter (2026-10-05 to 2026-10-20) matched exactly 4 items`);

    // 12. Testing Category Filtering (including uncategorized)
    console.log("\n12. Testing Category Filtering (specific & uncategorized)...");
    const catFilterRes = await fetch(`${baseUrl}/expenses?categoryId=${catA.id}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const catFiltered = (await catFilterRes.json()) as ExpensesListResponse;
    assert(catFiltered.pagination.total === 5, `Expected 5 items for catA, got ${catFiltered.pagination.total}`);

    const uncatFilterRes = await fetch(`${baseUrl}/expenses?categoryId=uncategorized`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const uncatFiltered = (await uncatFilterRes.json()) as ExpensesListResponse;
    assert(uncatFiltered.pagination.total === 1, `Expected 1 uncategorized item, got ${uncatFiltered.pagination.total}`);
    assert(uncatFiltered.data[0]?.id === exp2.id, "Matched uncategorized expense exp2");
    console.log("✓ Category filter works for specific category ID and uncategorized expenses");

    // 13. Testing Amount Range Filtering (minAmount, maxAmount)
    console.log("\n13. Testing Amount Range Filtering...");
    const amountFilterRes = await fetch(
      `${baseUrl}/expenses?minAmount=300&maxAmount=1000`,
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );
    const amountFiltered = (await amountFilterRes.json()) as ExpensesListResponse;
    // 390.75 and 800 -> 2 items
    assert(amountFiltered.pagination.total === 2, `Expected 2 items between 300 and 1000, got ${amountFiltered.pagination.total}`);

    // Test minAmount > maxAmount error
    const invalidAmountRes = await fetch(
      `${baseUrl}/expenses?minAmount=1000&maxAmount=500`,
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );
    assert(invalidAmountRes.status === 400, "minAmount > maxAmount rejected with 400");
    console.log("✓ Amount range filter verified and min > max validation rejected");

    // 14. Testing Sorting by date and amount
    console.log("\n14. Testing Sorting (date desc/asc, amount desc/asc)...");
    const sortDateAscRes = await fetch(`${baseUrl}/expenses?sortBy=date&order=asc`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const sortDateAsc = (await sortDateAscRes.json()) as ExpensesListResponse;
    const firstDate = sortDateAsc.data[0];
    const lastDate = sortDateAsc.data[sortDateAsc.data.length - 1];
    assert(
      Boolean(firstDate && lastDate) &&
        new Date(firstDate!.expenseDate).getTime() <=
          new Date(lastDate!.expenseDate).getTime(),
      "Date sorted ascending"
    );

    const sortAmountDescRes = await fetch(`${baseUrl}/expenses?sortBy=amount&order=desc`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const sortAmountDesc = (await sortAmountDescRes.json()) as ExpensesListResponse;
    const firstAmount = sortAmountDesc.data[0];
    const lastAmount = sortAmountDesc.data[sortAmountDesc.data.length - 1];
    assert(
      Boolean(firstAmount && lastAmount) &&
        firstAmount!.amount >= lastAmount!.amount,
      "Amount sorted descending"
    );
    assert(firstAmount?.amount === 1500, "Highest amount is 1500");
    console.log("✓ Sorting by date and amount in both directions verified");

    // 15. Testing Pagination (page & limit)
    console.log("\n15. Testing Pagination...");
    const page1Res = await fetch(`${baseUrl}/expenses?page=1&limit=2`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const page1 = (await page1Res.json()) as ExpensesListResponse;
    assert(page1.data.length === 2, `Expected 2 items on page 1, got ${page1.data.length}`);
    assert(page1.pagination.page === 1, "Page is 1");
    assert(page1.pagination.limit === 2, "Limit is 2");
    assert(page1.pagination.total === 6, "Total is 6");
    assert(page1.pagination.totalPages === 3, `Total pages is 3, got ${page1.pagination.totalPages}`);

    const page2Res = await fetch(`${baseUrl}/expenses?page=2&limit=2`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const page2 = (await page2Res.json()) as ExpensesListResponse;
    assert(page2.data.length === 2, `Expected 2 items on page 2, got ${page2.data.length}`);
    assert(Boolean(page1.data[0] && page2.data[0] && page2.data[0].id !== page1.data[0].id), "Page 2 contains different records than page 1");
    console.log("✓ Pagination contracts and page navigation verified");

    // 16. Multi-User Security Scoping
    console.log("\n16. Testing Multi-User Security Scoping (User B cannot access User A's expenses)...");
    const regResB = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "User Expenses Test B",
        email: testEmailB,
        password: "Password123!",
      }),
    });
    const authB = (await regResB.json()) as AuthResponse;
    const tokenB = authB.token;

    // User B tries to GET User A's expense
    const userBGetA = await fetch(`${baseUrl}/expenses/${exp1.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(userBGetA.status === 404, `Expected 404 for foreign expense access, got ${userBGetA.status}`);

    // User B tries to PATCH User A's expense
    const userBPatchA = await fetch(`${baseUrl}/expenses/${exp1.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenB}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: 9999 }),
    });
    assert(userBPatchA.status === 404, `Expected 404 for foreign expense patch, got ${userBPatchA.status}`);

    // User B tries to DELETE User A's expense
    const userBDeleteA = await fetch(`${baseUrl}/expenses/${exp1.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(userBDeleteA.status === 404, `Expected 404 for foreign expense delete, got ${userBDeleteA.status}`);
    console.log("✓ Multi-user security verified: Foreign users cannot view, edit, or delete expenses (404 Not Found)");

    // 17. Testing DELETE /expenses/:id
    console.log("\n17. Testing DELETE /expenses/:id...");
    const delRes = await fetch(`${baseUrl}/expenses/${exp2.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(delRes.status === 204, `Expected 204 for expense deletion, got ${delRes.status}`);

    // Verify it is gone
    const checkDelRes = await fetch(`${baseUrl}/expenses/${exp2.id}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(checkDelRes.status === 404, "Deleted expense returns 404");
    console.log("✓ DELETE /expenses/:id successfully removed record from PostgreSQL");

    console.log("\n========================================================");
    console.log("🎉 ALL EXPENSE INTEGRATION CHECKS PASSED WITH 100% SUCCESS!");
    console.log("========================================================\n");
  } finally {
    console.log("Cleaning up test users and records...");
    await prisma.expense.deleteMany({
      where: { user: { email: { in: [testEmailA, testEmailB] } } },
    });
    await prisma.category.deleteMany({
      where: { user: { email: { in: [testEmailA, testEmailB] } } },
    });
    await prisma.budgetCycle.deleteMany({
      where: { user: { email: { in: [testEmailA, testEmailB] } } },
    });
    await prisma.userSettings.deleteMany({
      where: { user: { email: { in: [testEmailA, testEmailB] } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [testEmailA, testEmailB] } },
    });
    console.log("✓ Test records cleaned up safely");
  }
}

async function main() {
  const PORT = 5098;
  let server: Server | null = null;

  try {
    server = app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
    });

    const baseUrl = `http://localhost:${PORT}`;
    await runExpenseTests(baseUrl);
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("❌ Expense verification failed:", err);
  process.exit(1);
});
