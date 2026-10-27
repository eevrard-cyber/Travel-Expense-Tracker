import http from "node:http";
import fs from "node:fs";

class CurrencyConverter {
  constructor(cadToUsd) {
    this.cadToUsd = cadToUsd;
  }

  toUsd(cad) {
    return cad * this.cadToUsd;
  }
}

class TravelExpense {
  constructor(date, destination, purpose, totalCad, currencyConverter) {
    this.date        = date;
    this.destination = destination;
    this.purpose     = purpose;
    this.totalCad    = totalCad;
    this.totalUsd    = 0;
    this.currencyConverter = currencyConverter;
  }

  convertToUsd() {
    this.totalUsd = this.currencyConverter.toUsd(this.totalCad);
  }

  get costCategory() {
    if (this.totalUsd < 500)  return "low";
    if (this.totalUsd < 1000) return "medium";
    return "high";
  }

toCsvRow() {
 return `${this.date},${this.destination},${this.purpose},` +
 `${this.totalCad},${this.totalUsd.toFixed(2)},${this.costCategory}`;
}

static fromColumns(columns, currencyConverter) {
    return new TravelExpense(
      columns[0].trim(),
      columns[1].trim(),
      columns[2].trim(),
      Number(columns[3]),
      currencyConverter
    );
  }
}

// ============================================================
// 1. READ RAW DATA
// ============================================================

const rawCsv   = fs.readFileSync("data/travel-expenses-raw.csv", "utf8");
const lines    = rawCsv.split(/\r?\n/);
const rateText = fs.readFileSync("data/exchange-rate.txt", "utf8");
const cadToUsd = Number(rateText.trim());

if (Number.isNaN(cadToUsd)) {
  throw new Error("The CAD-to-USD exchange rate is not a number.");
}

const currencyConverter = new CurrencyConverter(cadToUsd);

// ============================================================
// 2. CLEAN + WRANGLE
// ============================================================

let totalUsd = 0;
let validCount = 0;
let rejectedCount = 0;
const expenses = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();

  if (line === "") {
    continue;
  }

  const columns = line.split(",");
  const expense = TravelExpense.fromColumns(columns, currencyConverter);
  console.log(columns);

  if (
    expense.destination === "" ||
    Number.isNaN(expense.totalCad) ||
    expense.totalCad <= 0
  ) {
    rejectedCount++;
    continue;
  }

  expense.convertToUsd();
  totalUsd += expense.totalUsd;

  expenses.push(expense);
  validCount++;
}

console.log(expenses.length);
console.log(expenses[0]);
console.log(expenses[0] instanceof TravelExpense);

// ============================================================
// 3. SAVE CLEAN DATA
// ============================================================
let cleanCSV = "date,destination,purpose,totalCad,totalUsd,costCategory\n";

for (const expense of expenses) {
  cleanCSV += expense.toCsvRow() + "\n";
}

const averageUsd = validCount === 0 ? 0 : totalUsd / validCount;

fs.writeFileSync("data/travel-expenses-clean.csv", cleanCSV, "utf8");

console.log(`Average USD amount: ${averageUsd.toFixed(2)}`);
console.log(`Total USD amount: ${totalUsd.toFixed(2)}`);

const highCostExpenses = expenses.filter((expense) => {
  return expense.costCategory === "high";
});

console.log(highCostExpenses.length);

const highCostDestinations =
 highCostExpenses.map((expense) => {
 return expense.destination;
 });

console.log(highCostDestinations);


// ============================================================
// 4. SERVE CLEAN DATA
// ============================================================

const server     = http.createServer((req, res) => {
const requestUrl = new URL(req.url, "http://localhost:3000");

  if (requestUrl.pathname === "/") {
    const html = fs.readFileSync("index.html", "utf8");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }

  if (requestUrl.pathname === "/summary") {
    const cleanLines = fs
      .readFileSync("data/travel-expenses-clean.csv", "utf8")
      .split(/\r?\n/);

    let tableRows  = "";
    let shownCount = 0;

    for (let i = 1; i < cleanLines.length && shownCount < 10; i++) {
      const line = cleanLines[i].trim();

      if (line === "") {
        continue;
      }

      const columns = line.split(",");
      tableRows += "<tr>";

      for (let j = 0; j < columns.length; j++) {
        tableRows += `<td>${columns[j]}</td>`;
      }

      tableRows += "</tr>";
      shownCount++;
    }

    const summaryHtml = `
      <section class="summary-card">
        <h2>Travel Summary</h2>
        <div class="stats">
          <p><strong>Valid records:</strong> ${validCount}</p>
          <p><strong>Rejected records:</strong> ${rejectedCount}</p>
          <p><strong>CAD-to-USD rate:</strong> ${cadToUsd}</p>
          <p><strong>Total valid expenses:</strong> ${expenses.length}</p>
          <p><strong>Total USD:</strong> $${totalUsd.toFixed(2)}</p>
          <p><strong>Average USD per expense: </strong> $${averageUsd.toFixed(2)}</p>
          <p><strong>High-cost expenses:</strong> ${highCostExpenses.length}</p>
          <p><strong>High-cost destination names:</strong> ${highCostDestinations.length > 0 ? highCostDestinations.join(", ") : "None"}</p>
        </div>
        <h3>First 10 cleaned records</h3>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Destination</th>
                <th>Purpose</th>
                <th>Total CAD</th>
                <th>Total USD</th>
                <th>Cost Category</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </section>
    `;

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(summaryHtml);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});