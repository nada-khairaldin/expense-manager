-- AlterTable
ALTER TABLE "BudgetCycle" DROP COLUMN "incomeAmount";

-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "defaultBudgetAmount" DECIMAL(12,2);
