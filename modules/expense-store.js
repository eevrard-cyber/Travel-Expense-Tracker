import fs from "node:fs";

const DATA_FILE = "data/expenses.json";

export function loadExpenses() {
  const text = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(text);
}

export function saveExpenses(expenses) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(expenses, null, 2),
    "utf8"
  );
}