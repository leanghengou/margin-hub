<!--
README v2 (draft). Before publishing:
1. Replace {{LIVE_URL}} with your Vercel link.
2. Add the screenshots to docs/screenshots/ with the file names used below.
3. Views section: swap the two SQL sketches for your real code, and paste the other four.
   Run this in the Neon SQL Editor for each view:  SELECT pg_get_viewdef('v_entry_cost', true);
4. Check the column names in the ERD against your real tables.
Delete this comment when you're done.
-->
 
# Margin Hub
 
A dashboard that shows a digital agency which clients, services and people make money, and which ones lose it.
 
**Live demo: [{{LIVE_URL}}](https://margin-1ye4kbzqf-heng-portfolio.vercel.app/)**
 
![Margin Hub home page](docs/screenshots/home.png)
 
## Overview
 
An agency can be busy every day and still not make money. Margin Hub helps the owner see which services actually turn a profit, which clients take more time than they pay for, and who on the team is overloaded or doesn’t have enough to do. Every hour logged is tied to a person and a client, so the numbers show what’s really going on.
 
## The problem
 
Most agencies lose money in the same few ways:
 
- **Scope creep.** A client pays a fixed monthly fee, but the work keeps growing. After a while, serving them costs more than they pay.
- **Uneven workload.** Everyone works the same hours. Some people get buried in one project while others sit with little to do, and both cost money.
- **Not every client is worth keeping.** A client can look fine on paper and still lose money. Some also pay late, and nobody notices.
- **Busy doesn’t mean profitable.** A service can bring in lots of work and still earn very little, while a simpler one ends up paying the bills.
It all comes down to one gap: what a client budgeted, what they actually paid, and what the work really cost.
 
## The questions that solve it
 
To close that gap, the owner needs answers to five questions:
 
| Question | What we measure | Where to look |
| --- | --- | --- |
| Which clients make money, and which cost more than they pay? | Profit and margin per client | Home, Clients |
| Which services earn the best margin? | Margin and profit per hour by service | Services |
| Which teams bring in the most per hour? | Revenue per hour | Team |
| Who has too much work, and who doesn’t have enough? | Utilisation | Team |
| Which projects are using up their hours too fast? | Budget burn | Services |
 
Here’s how each number is worked out:
 
| Metric | How it’s calculated |
| --- | --- |
| Revenue | What was invoiced: monthly retainers (SEO, AEO/GEO, CRO, Paid Ads) plus one-time project fees (websites) |
| Cost | Hours logged × the person’s hourly cost on that day |
| Gross profit | Revenue − cost |
| Margin | Gross profit ÷ revenue |
| Utilisation | Billable hours ÷ available hours |
| Revenue per hour | Revenue ÷ hours logged |
| Budget burn | Hours used this month ÷ hours budgeted |
 
## The tables
 
To answer those questions, I built ten tables in a star schema. `time_entries` sits in the middle, and the other tables describe the people, clients and services it points to.
 
```mermaid
erDiagram
    teams ||--o{ employees : employs
    teams ||--o{ services : delivers
    employees ||--o{ employee_rates : "rate history"
    employees ||--o{ time_entries : logs
    clients ||--o{ time_entries : "worked for"
    services ||--o{ time_entries : "type of work"
    projects ||--o{ time_entries : "part of"
    clients ||--o{ projects : buys
    services ||--o{ projects : sells
    clients ||--o{ client_budgets : "monthly hours"
    clients ||--o{ invoices : "billed"
    services ||--o{ invoices : "billed for"
    dim_date ||--o{ time_entries : "work_date"
 
    time_entries {
        int id PK
        int employee_id FK
        int client_id FK
        int service_id FK
        int project_id FK
        date work_date
        numeric hours
        boolean billable
    }
    employee_rates {
        int id PK
        int employee_id FK
        numeric hourly_cost
        date valid_from
        date valid_to
    }
    clients {
        int id PK
        text name
        text industry
        int tier
        date start_date
        date end_date
    }
    invoices {
        int id PK
        int client_id FK
        int service_id FK
        date month
        numeric amount
    }
```
 
| Table | What’s in it | Used for |
| --- | --- | --- |
| `time_entries` | Every hour logged: who, which client, service and project, which day, billable or not | Cost, utilisation, burn |
| `employees` | Each person’s team, weekly hours, and start and end dates | Utilisation |
| `employee_rates` | Each person’s hourly cost and when it applied | Cost |
| `teams` | The agency’s teams | Team performance |
| `services` | SEO, AEO/GEO, CRO, Paid Ads, web development | Service margins |
| `clients` | Industry, tier, and start and end dates | Tier, industry, churn |
| `projects` | What each client bought and how it’s priced: retainer, fixed fee or hourly | Revenue type |
| `client_budgets` | Hours budgeted per client, service and month | Budget burn |
| `invoices` | What each client was billed each month, and whether they’ve paid | Revenue, unpaid invoices |
| `dim_date` | One row per day, with month, quarter and whether it’s a workday | Monthly totals, capacity |
 
Two decisions shaped the rest:
 
- **Costs use rate history.** When someone gets a raise, it goes into `employee_rates` with a start date. Each hour is costed at the rate that person had on that day, so a raise this year doesn’t change last year’s numbers.
- **Revenue comes from invoices, not hours.** A retainer client pays the same fee no matter how many hours they use. That’s what makes over-servicing show up.
## The views
 
Each number is defined once, in a view, and the app just reads it. The views only count work up to today, and every time range counts back from today, so the dashboard moves forward on its own, like a real agency’s books.
 
| View | What it answers | Used on |
| --- | --- | --- |
| `v_entry_cost` | What each logged hour cost, at that day’s rate | Every profit number |
| `v_client_month_pnl` | Revenue, cost, profit and margin per client per month | Home, Clients |
| `v_service_month_pnl` | The same, per service | Services |
| `v_employee_utilisation` | Billable hours against available hours, per person per week | Team |
| `v_team_performance` | Revenue per hour, by team | Team |
| `v_budget_burn` | Hours used this month against budget, flagged at 80% | Services |
 
<!-- The two blocks below are sketches of the logic. Replace them with your real view code. -->
 
**`v_entry_cost`: costing each hour at the right rate.** A range join finds the rate each person had on the day they did the work.
 
```sql
SELECT te.id,
       te.client_id,
       te.service_id,
       te.work_date,
       te.hours,
       te.hours * er.hourly_cost AS labour_cost
FROM time_entries te
JOIN employee_rates er
  ON er.employee_id = te.employee_id
 AND te.work_date >= er.valid_from
 AND (er.valid_to IS NULL OR te.work_date < er.valid_to)
WHERE te.work_date <= current_date;
```
 
**`v_client_month_pnl`: monthly profit per client.** CTEs work out cost and revenue separately. A full join keeps months that only have one of the two, and `LAG` compares each month with the one before.
 
```sql
WITH cost AS (
  SELECT client_id,
         date_trunc('month', work_date)::date AS month,
         SUM(labour_cost) AS labour_cost
  FROM v_entry_cost
  GROUP BY 1, 2
),
revenue AS (
  SELECT client_id, month, SUM(amount) AS revenue
  FROM invoices
  WHERE month <= current_date
  GROUP BY 1, 2
),
pnl AS (
  SELECT COALESCE(r.client_id, c.client_id) AS client_id,
         COALESCE(r.month, c.month)         AS month,
         COALESCE(r.revenue, 0)             AS revenue,
         COALESCE(c.labour_cost, 0)         AS labour_cost
  FROM revenue r
  FULL JOIN cost c
    ON c.client_id = r.client_id
   AND c.month = r.month
)
SELECT client_id,
       month,
       revenue,
       labour_cost,
       revenue - labour_cost AS gross_profit,
       ROUND(100 * (revenue - labour_cost) / NULLIF(revenue, 0), 1) AS margin_pct,
       (revenue - labour_cost)
         - LAG(revenue - labour_cost) OVER (PARTITION BY client_id ORDER BY month)
         AS profit_change_vs_last_month
FROM pnl;
```
 
<details>
<summary><code>v_service_month_pnl</code></summary>
```sql
-- Paste the output of: SELECT pg_get_viewdef('v_service_month_pnl', true);
```
 
</details>
<details>
<summary><code>v_employee_utilisation</code></summary>
```sql
-- Paste the output of: SELECT pg_get_viewdef('v_employee_utilisation', true);
```
 
</details>
<details>
<summary><code>v_team_performance</code></summary>
```sql
-- Paste the output of: SELECT pg_get_viewdef('v_team_performance', true);
```
 
</details>
<details>
<summary><code>v_budget_burn</code></summary>
```sql
-- Paste the output of: SELECT pg_get_viewdef('v_budget_burn', true);
```
 
</details>
## The stack
 
| Layer | Tool | Why I picked it |
| --- | --- | --- |
| Database | PostgreSQL | The SQL is the main part of this project. Postgres has strong window functions, CTEs, materialised views, and handy date tools like `date_trunc` and `generate_series` |
| App | Next.js (App Router) | Front end and back end in one place, and pages can query the database directly |
| Database access | postgres.js, raw SQL | No ORM, so every query is easy to see and read |
| Styling | Tailwind CSS | Quick to build clean, consistent layouts |
| Charts | Chart.js (react-chartjs-2) | Simple charts straight from the view data |
| Hosting | Vercel + Neon | The app runs on Vercel and the database on Neon |
 
## Features
 
### Service lines
 
Margin, profit per hour and a monthly trend for each service.
 
![Services page](docs/screenshots/services.png)
 
### Period selector
 
Every page can switch between the last 3, 6 or 12 months, or all time. The choice is saved in the URL, so you can bookmark or share a view.
 
### Revenue by tier
 
Clients are grouped by size. **Tier 1** is large companies, **Tier 2** is medium-sized businesses, and **Tier 3** is small and one-person businesses. You can see how the agency does with each kind of client, not just overall.
 
![Clients page](docs/screenshots/clients.png)
 
### Revenue by industry
 
Revenue and profit for each of the nine industries the agency works with. It shows where the agency is strongest and which industries are worth going after.
 
### Client list
 
Every client’s lifetime revenue, profit and margin, with their tier, industry and status. Losses show in red.
 
### Unpaid invoices
 
Every unpaid invoice, with the client, service, amount and how many days it’s overdue, so you know who to chase.
 
### Budget burn
 
Hours used this month against each project’s budget. The bar is green while things are on track, amber past 80%, and red once a project goes over. A project manager can spot trouble before the month ends, not after.
 
![Budget burn](docs/screenshots/budget-burn.png)
 
### Utilisation heatmap
 
One row per person, one square per week. Yellow means under 40% (not enough work), green goes up to 100%, and red means over capacity.
 
![Utilisation heatmap](docs/screenshots/utilisation.png)
 
## What the data shows
 
### SEO brings in the most
 
SEO, sold together with AEO/GEO, brings in the most profit and the most work. Paid Ads is the most stable month to month, while SEO and web development go up and down more.
 
### Small clients are worth the most each
 
Over the three months to Nov 18, 2026:
 
| Tier | Clients | Revenue | Profit | Margin | Profit per client |
| --- | --- | --- | --- | --- | --- |
| Tier 1 (large) | 10 | $246K | $189K | 77% | $19K |
| Tier 2 (medium) | 19 | $639K | $518K | 81% | $27K |
| Tier 3 (small) | 7 | $284K | $239K | 84% | $34K |
 
Tier 2 makes the most profit overall because it has the most clients. But Tier 3, with only seven clients, has the best margin and the most profit per client, almost twice as much as a Tier 1 client. Small businesses might be worth going after more.
 
### E-commerce is the biggest industry
 
E-commerce is the agency’s largest industry, with 10 clients in the last three months.
 
### One new client is already losing money
 
Stroman - Welch, a Tier 1 SaaS client since June 2026, has paid $32,790, but serving them has cost $2,380 more than that.
 
### One person was overloaded for three months
 
Martha Wehner worked over 100% of her hours every week from July to September 2026. That’s a real burnout risk, and the heatmap makes it easy to spot.
 
## UI and UX
 
Built for the agency owner: what needs attention, at a glance.
 
- **Red only means a problem.** Losses, overruns, overloaded people and late invoices are red. Nothing else is.
- **Every number shows its time period.** Each card says whether it covers 3 months, all time or this month, so you always know what you’re looking at.
- **The period is always visible.** I used buttons instead of a dropdown, so you can see which period is selected.
- **Each service keeps its colour.** SEO, CRO, Paid Ads and the rest use the same colour on every chart and table.
- **Patterns first, numbers second.** The heatmap and burn bars show trouble before you read a single number.
- **Key details sit next to the name.** Tier and status tags sit beside each client, so you don’t have to look anything up.
 
