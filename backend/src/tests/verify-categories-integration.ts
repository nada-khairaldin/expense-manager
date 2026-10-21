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

interface CategoryResponse {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  color: string | null;
  monthlyLimit: number | null;
  limit: number | null;
  spent: number | null;
  transactionCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseResponse {
  id: string;
  amount: number;
  categoryId: string | null;
  categoryName: string;
  description: string | null;
  expenseDate: string;
}

async function runCategoryTests(baseUrl: string) {
  console.log("\n========================================================");
  console.log("Starting Real Category Backend & Database Verification");
  console.log("========================================================\n");

  const timestamp = Date.now();
  const testEmailA = `cat-test-user-a-${timestamp}@example.com`;
  const testEmailB = `cat-test-user-b-${timestamp}@example.com`;

  try {
    // 1. Authentication check
    console.log("1. Verifying Authentication Enforcement on /categories...");
    const unauthGet = await fetch(`${baseUrl}/categories`);
    assert(unauthGet.status === 401, `Expected 401 for unauthenticated GET /categories, got ${unauthGet.status}`);

    const unauthPost = await fetch(`${baseUrl}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Unauth" }),
    });
    assert(unauthPost.status === 401, `Expected 401 for unauthenticated POST /categories, got ${unauthPost.status}`);
    console.log("✓ Unauthenticated category requests are rejected with 401");

    // 2. Register test user A
    console.log("\n2. Registering test user A...");
    const regResA = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Category Tester A",
        email: testEmailA,
        password: "Password123!",
      }),
    });
    assert(regResA.status === 201, `Registration failed with status ${regResA.status}`);
    const regDataA = (await regResA.json()) as AuthResponse;
    const tokenA = regDataA.token;
    const userIdA = regDataA.user.id;
    console.log("✓ User A registered successfully");

    // 3. GET /categories for new user -> MUST be empty array (no mock data!)
    console.log("\n3. Testing GET /categories for new user (Empty State verification)...");
    const getRes1 = await fetch(`${baseUrl}/categories`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(getRes1.status === 200, `Expected 200, got ${getRes1.status}`);
    const categories1 = (await getRes1.json()) as CategoryResponse[];
    assert(Array.isArray(categories1), "Expected array of categories");
    assert(categories1.length === 0, `Expected empty array for new user, got length ${categories1.length}`);
    console.log("✓ GET /categories returns empty array [] for new user without mock fallback");

    // 4. Input validation tests (name empty, name whitespace, negative limit)
    console.log("\n4. Testing Input Validation on POST /categories...");
    const emptyNameRes = await fetch(`${baseUrl}/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "   " }),
    });
    assert(emptyNameRes.status === 400, `Expected 400 for empty/whitespace name, got ${emptyNameRes.status}`);

    const negLimitRes = await fetch(`${baseUrl}/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Test Negative", monthlyLimit: -500 }),
    });
    assert(negLimitRes.status === 400, `Expected 400 for negative limit, got ${negLimitRes.status}`);

    const badColorRes = await fetch(`${baseUrl}/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Test Bad Color", color: "blue" }),
    });
    assert(badColorRes.status === 400, `Expected 400 for invalid hex color, got ${badColorRes.status}`);
    console.log("✓ Server validation correctly rejects empty names, negative limits, and invalid colors");

    // 5. Create category with limit
    console.log("\n5. Testing POST /categories with monthly limit...");
    const createRes1 = await fetch(`${baseUrl}/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "البقالة والتموين",
        color: "#16856B",
        icon: "ShoppingCart",
        monthlyLimit: 3500,
      }),
    });
    assert(createRes1.status === 201, `Expected 201 for create category, got ${createRes1.status}`);
    const cat1 = (await createRes1.json()) as CategoryResponse;
    assert(Boolean(cat1.id), "Created category must have an id");
    assert(cat1.userId === userIdA, "Created category must belong to user A");
    assert(cat1.name === "البقالة والتموين", "Category name matches");
    assert(cat1.color === "#16856B", "Category color matches");
    assert(cat1.icon === "ShoppingCart", "Category icon matches");
    assert(cat1.monthlyLimit === 3500, `Expected monthlyLimit: 3500, got ${cat1.monthlyLimit}`);
    assert(cat1.limit === 3500, `Expected limit alias: 3500, got ${cat1.limit}`);
    console.log(`✓ Category 1 created with ID: ${cat1.id} and persisted with limit: ${cat1.monthlyLimit}`);

    // 6. Create category without limit (optional limit requirement)
    console.log("\n6. Testing POST /categories without limit (optional limit)...");
    const createRes2 = await fetch(`${baseUrl}/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "مصاريف عامة وطارئة",
        color: "#64748B",
        icon: "Layers",
      }),
    });
    assert(createRes2.status === 201, `Expected 201, got ${createRes2.status}`);
    const cat2 = (await createRes2.json()) as CategoryResponse;
    assert(cat2.monthlyLimit === null, `Expected monthlyLimit to be null, got ${cat2.monthlyLimit}`);
    assert(cat2.limit === null, `Expected limit alias to be null, got ${cat2.limit}`);
    console.log(`✓ Category 2 created with ID: ${cat2.id} without limit (monthlyLimit: null)`);

    // 7. Test Duplicate Category Name -> 409 Conflict
    console.log("\n7. Testing duplicate category prevention...");
    const dupRes = await fetch(`${baseUrl}/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "البقالة والتموين",
        color: "#22C55E",
      }),
    });
    assert(dupRes.status === 409, `Expected 409 Conflict for duplicate category name, got ${dupRes.status}`);
    console.log("✓ Duplicate category names correctly rejected with 409 Conflict");

    // 8. GET /categories/:id
    console.log("\n8. Testing GET /categories/:id...");
    const getByIdRes = await fetch(`${baseUrl}/categories/${cat1.id}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(getByIdRes.status === 200, `Expected 200, got ${getByIdRes.status}`);
    const fetchedCat1 = (await getByIdRes.json()) as CategoryResponse;
    assert(fetchedCat1.id === cat1.id, "Category ID matches");
    assert(fetchedCat1.name === "البقالة والتموين", "Category name matches");
    console.log("✓ GET /categories/:id successfully retrieves category details");

    // 9. Update category with PATCH and PUT
    console.log("\n9. Testing Category Updates (PATCH & PUT)...");
    const patchRes = await fetch(`${baseUrl}/categories/${cat1.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "البقالة والمستلزمات الغذائية",
        monthlyLimit: 4000,
      }),
    });
    assert(patchRes.status === 200, `Expected 200 for PATCH, got ${patchRes.status}`);
    const patchedCat1 = (await patchRes.json()) as CategoryResponse;
    assert(patchedCat1.name === "البقالة والمستلزمات الغذائية", "Name updated");
    assert(patchedCat1.monthlyLimit === 4000, "Limit updated");

    const putRes = await fetch(`${baseUrl}/categories/${cat1.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "البقالة والتموين",
        monthlyLimit: 3800,
      }),
    });
    assert(putRes.status === 200, `Expected 200 for PUT, got ${putRes.status}`);
    const putCat1 = (await putRes.json()) as CategoryResponse;
    assert(putCat1.name === "البقالة والتموين", "Name restored");
    assert(putCat1.monthlyLimit === 3800, "Limit updated via PUT");
    console.log("✓ Category update via PATCH and PUT verified and persisted");

    // 10. Persistence verification via fresh GET
    console.log("\n10. Testing Persistence after updates...");
    const freshListRes = await fetch(`${baseUrl}/categories`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const freshList = (await freshListRes.json()) as CategoryResponse[];
    assert(freshList.length === 2, `Expected 2 categories, got ${freshList.length}`);
    const persistedCat1 = freshList.find((c) => c.id === cat1.id);
    assert(persistedCat1?.monthlyLimit === 3800, "Persisted limit matches");
    console.log("✓ Categories list reflects persisted database state");

    // 11. Historical Expense Protection on Deletion (Section 8)
    console.log("\n11. Testing Historical Expense Protection on Category Deletion (Section 8)...");
    // Set up budget setup for user A so budget cycles and expenses can be created
    await fetch(`${baseUrl}/settings/budget-setup`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currency: "ILS",
        budgetRenewalDay: 1,
        defaultBudgetAmount: 10000,
      }),
    });

    // Create an expense linked to cat1
    const createExpenseRes = await fetch(`${baseUrl}/expenses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 250,
        categoryId: cat1.id,
        description: "مشتريات حليب وخبز أسبوعية",
        date: new Date().toISOString().split("T")[0],
      }),
    });
    assert(createExpenseRes.status === 201, `Failed to create expense: ${createExpenseRes.status}`);
    const expenseData = (await createExpenseRes.json()) as ExpenseResponse;
    const expenseId = expenseData.id;
    assert(expenseData.categoryId === cat1.id, "Expense initially linked to category 1");
    assert(expenseData.categoryName === "البقالة والتموين", "Expense has category snapshot");
    console.log(`  - Expense created (${expenseId}) linked to category "${cat1.name}"`);

    // Delete category 1
    const deleteRes = await fetch(`${baseUrl}/categories/${cat1.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(deleteRes.status === 204, `Expected 204 for category delete, got ${deleteRes.status}`);
    console.log("  - DELETE /categories/:id returned 204 No Content");

    // Verify category 1 is gone from category list
    const afterDeleteCatRes = await fetch(`${baseUrl}/categories`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const afterDeleteCats = (await afterDeleteCatRes.json()) as CategoryResponse[];
    assert(!afterDeleteCats.some((c) => c.id === cat1.id), "Deleted category must not appear in list");
    console.log("  - Deleted category no longer appears in GET /categories");

    // Verify historical expense still exists and data is preserved!
    const expenseCheckRes = await fetch(`${baseUrl}/expenses/${expenseId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(expenseCheckRes.status === 200, `Historical expense must still exist! Got ${expenseCheckRes.status}`);
    const preservedExpense = (await expenseCheckRes.json()) as ExpenseResponse;
    assert(preservedExpense.amount === 250, "Expense amount preserved");
    assert(preservedExpense.categoryId === null, `Expected categoryId to be null, got ${preservedExpense.categoryId}`);
    assert(
      preservedExpense.categoryName === "البقالة والتموين",
      `Expected categoryNameSnapshot preserved as "البقالة والتموين", got "${preservedExpense.categoryName}"`
    );
    assert(preservedExpense.description === "مشتريات حليب وخبز أسبوعية", "Description preserved");
    console.log("✓ Section 8 PASS: Historical expense was NOT deleted; amount, date, description, and snapshot name preserved with categoryId = null!");

    // 12. Security Scoping (User Isolation)
    console.log("\n12. Testing Multi-User Security Scoping...");
    const regResB = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Category Tester B",
        email: testEmailB,
        password: "Password123!",
      }),
    });
    const regDataB = (await regResB.json()) as AuthResponse;
    const tokenB = regDataB.token;

    // User B tries to view User A's category 2
    const userBAccessRes = await fetch(`${baseUrl}/categories/${cat2.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(userBAccessRes.status === 404, `User B should get 404 for User A's category, got ${userBAccessRes.status}`);

    // User B tries to edit User A's category 2
    const userBEditRes = await fetch(`${baseUrl}/categories/${cat2.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenB}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Hacked" }),
    });
    assert(userBEditRes.status === 404, `User B edit should be rejected with 404, got ${userBEditRes.status}`);

    // User B tries to delete User A's category 2
    const userBDeleteRes = await fetch(`${baseUrl}/categories/${cat2.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(userBDeleteRes.status === 404, `User B delete should be rejected with 404, got ${userBDeleteRes.status}`);
    console.log("✓ Multi-user security verified: Users cannot read, edit, or delete categories belonging to others");

  } finally {
    // 13. Clean up test users and their expenses/categories
    console.log("\n13. Cleaning up test records...");
    await prisma.user.deleteMany({
      where: { email: { in: [testEmailA, testEmailB] } },
    });
    console.log("✓ Test records cleaned up safely");
  }
}

async function main() {
  let server: Server | null = null;
  try {
    const testPort = 5558;
    server = await new Promise<Server>((resolve) => {
      const s = app.listen(testPort, "127.0.0.1", () => resolve(s));
    });
    const baseUrl = `http://127.0.0.1:${testPort}`;

    await runCategoryTests(baseUrl);

    console.log("\n========================================================");
    console.log("🎉 ALL CATEGORY INTEGRATION CHECKS PASSED WITH 100% SUCCESS!");
    console.log("========================================================\n");
  } catch (error) {
    console.error("\n❌ Category verification failed:", error);
    process.exit(1);
  } finally {
    if (server) {
      (server as Server).close();
    }
    await prisma.$disconnect();
  }
}

main();
