export function totalExpenses(expenses) {
    return expenses.reduce((sum, expense) => {
        return sum + expense.totalUsd;
    }, 0);
}