const expenses = [
  {
    id: 1,
    amount: 50,
    category: "Groceries",
  },
  {
    id: 2,
    amount: 30,
    category: "Education",
  },
];

export function fetchExpenses() {
  return expenses;
}