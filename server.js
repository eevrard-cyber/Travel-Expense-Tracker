import http from "node:http";
import fs from "node:fs";

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

// ============================================================
// 2. CLEAN + WRANGLE
// ============================================================

let validCount = 0;
let rejectedCount = 0;
let cleanCsv =
  "date,destination,purpose,total_cad,total_usd,cost_category\n";

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();

  if (line === "") {
    continue;
  }

const expense = {
  date: columns[0].trim(),
  destination: columns[1].trim(),
  purpose: columns[2].trim(),
  totalCad: Number(columns[3]),
  totalUsd: 0,
  costCategory: ""
};

  const columns = line.split(",");
  const date = columns[0].trim();
  const destination = columns[1].trim();
  const purpose = columns[2].trim();
  const totalCad = Number(columns[3]);

  if (destination === "" || 
    Number.isNaN(expense.totalCad) || totalCad <= 0) {
    rejectedCount++;
    continue;
  }

  const totalUsd = totalCad * cadToUsd;
  let costCategory;

  if (totalUsd < 500) {
    costCategory = "low";
  } else if (totalUsd < 1500) {
    costCategory = "medium";
  } else {
    costCategory = "high";
  }

  cleanCsv +=
    `${date},${destination},${purpose},${totalCad},` +
    `${totalUsd.toFixed(2)},${costCategory}\n`;
  validCount++;
}

// ============================================================
// 3. SAVE CLEAN DATA
// ============================================================

fs.writeFileSync("data/travel-expenses-clean.csv", cleanCsv);

// ============================================================
// 4. SERVE CLEAN DATA
// ============================================================

const server = http.createServer((req, res) => {
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

    let tableRows = "";
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