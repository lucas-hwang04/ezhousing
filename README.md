<<<<<<< HEAD
# Expense Tracker Lite

A simple, modern expense tracker built with only HTML, CSS, and JavaScript. No frameworks, no build tools—just open `index.html` in your browser and start tracking your income and expenses instantly.

## Features

- **Add Transactions**: Quickly add income or expense entries with type, category, amount, date, and optional note.
- **Summary Cards**: See your total income, expenses, and balance at a glance.
- **Transaction List**: View all transactions, search by note or category, and delete entries as needed.
- **Insights & Analytics**:
  - **KPIs**: See transactions count, top expense category, and average expense for the current month.
  - **Expenses by Category**: Pie chart showing your spending breakdown for the current month.
  - **Income vs Expense by Month**: Line chart comparing income and expenses for the last 6 months.
- **Search**: Filter transactions by note or category in real time.
- **Local Persistence**: All data is saved in your browser's localStorage—no account or backend required.
- **Responsive Design**: Works great on desktop and mobile.

## How to Use

1. **Open the app**: Double-click `index.html` or open it in your browser.
2. **Add a transaction**: Fill out the form and click "Add".
3. **View summary**: See your totals update instantly.
4. **Analyze spending**: Check the Insights section for charts and KPIs.
5. **Search or delete**: Use the search bar to filter, or click "Delete" to remove a transaction.

## File Structure

- `index.html` — Main app UI and layout
- `styles.css` — Modern, dark-themed styles
- `app.js` — All app logic: add/delete, search, analytics, chart rendering
- `README.md` — This documentation

## Tech Stack

- HTML5
- CSS3 (custom, no frameworks)
- JavaScript (ES6+)
- [Chart.js](https://www.chartjs.org/) via CDN for analytics

## Data Model

Each transaction has:
- `id`: unique string
- `type`: "income" or "expense"
- `category`: category name
- `amount`: number
- `date`: ISO date string
- `note`: optional description

## Privacy

All data is stored locally in your browser. No data is sent to any server.

## Optional: Serve with Python

If you want to run a local server (not required):
```powershell
cd "C:\Users\Administrator\Downloads\Web-dev-mini-projects-main\tracker"
python -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

## License

MIT — free to use, modify, and share.
