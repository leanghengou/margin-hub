<!--
Before publishing:
1. Fill every {{}} in "Interesting findings" from the dashboard (3-month view), then sort each table by revenue.
2. Views section: swap the two SQL sketches for your real code, and paste the other four.
   Run this in the Neon SQL Editor for each view:  SELECT pg_get_viewdef('v_entry_cost', true);
3. Check the column names in the ERD against your real tables.
4. Optional: drag screenshots in on GitHub next to each feature.
Delete this comment when you're done.
-->

<img width="1906" height="1191" alt="Mask group" src="https://github.com/user-attachments/assets/8d221c52-db8a-4224-9617-e7f0a1408dae" />

# Margin Hub

A dashboard that shows a digital agency which clients, services and people make money, and which ones lose it.

**Live demo: [https://margin-hub-tau.vercel.app](https://margin-hub-tau.vercel.app)**

## Overview

An agency can be busy every day and still not make money. Margin Hub helps the owner see which services actually turn a profit, which clients take more time than they pay for, and who on the team is overloaded or doesn’t have enough to do. Every hour logged is tied to a person and a client, so the numbers show what’s really going on.

## The problem

Most agencies lose money in the same few ways:

- **Scope creep.** A client sets a budget for a project, but the work ends up needing more hours than planned. Every hour costs the agency money, so after a while the project turns from a profit into a loss.
- **Busy and idle staff.** Most of the team works full-time, nine to five. Some people have more work than they can handle, while others have a lot of free time. Both cost the agency money.
- **Profitable and unprofitable clients.** A client can look fine on paper and still lose money. Some also pay late, and nobody notices.
- **Busy doesn’t mean profitable.** A service can bring in lots of work and still earn very little, while a simpler one ends up paying the bills.

It all comes down to one gap: what a client budgeted, what they actually paid, and what the work really cost.

## The questions that solve the problem

To close that gap, the owner needs answers to five questions:

| Question | What we measure | Where to look |
| --- | --- | --- |
| Which clients make money, and which cost more than they pay? | Profit and margin per client | Home, Clients |
| Which services bring in the most revenue, the most profit and the best margin? | Revenue, profit and margin by service | Services |
| Which teams bring in the most revenue, and how does their labour cost compare with their profit? | Revenue, labour cost and gross profit by team | Team |
| Who has too much work, and who doesn’t have enough? | Utilisation | Team |
| How is the agency doing overall, and how many active clients does it have? | Revenue, gross profit, margin and active clients over the last 3, 6 or 12 months | Home |

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

<img width="1861" height="1304" alt="Group 40" src="https://github.com/user-attachments/assets/0feefd1f-90ad-47d4-9856-aa46de12cfa8" />

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

[Open the Services page](https://margin-hub-tau.vercel.app/services)


<img width="1906" height="1191" alt="Mask group" src="https://github.com/user-attachments/assets/4bcefae4-1c1b-405c-9911-03e2105cd2b8" />


### Period selector

Every page can switch between the last 3, 6 or 12 months, or all time. The choice is saved in the URL, so you can bookmark or share a view.

### Revenue by tier

Clients are grouped by size. **Tier 1** is large companies, **Tier 2** is medium-sized businesses, and **Tier 3** is small and one-person businesses. You can see how the agency does with each kind of client, not just overall.

[Open the Clients page](https://margin-hub-tau.vercel.app/clients)


<img width="1906" height="1191" alt="Group 44" src="https://github.com/user-attachments/assets/eab13974-06b2-4a8d-941b-37230bd75a0e" />


### Revenue by industry

Revenue and profit for each of the nine industries the agency works with. It shows where the agency is strongest and which industries are worth going after.

<img width="1737" height="906" alt="image 8" src="https://github.com/user-attachments/assets/a20d0bc4-25c4-472a-a774-cbef4e89164d" />

### Client list

Every client’s lifetime revenue, profit and margin, with their tier, industry and status. Losses show in red.

### Unpaid invoices

Every unpaid invoice, with the client, service, amount and how many days it’s overdue, so you know who to chase.

### Budget burn

Hours used this month against each project’s budget. The bar is green while things are on track, amber past 80%, and red once a project goes over. A project manager can spot trouble before the month ends, not after.

[Open the Services page](https://margin-hub-tau.vercel.app/services)


<img width="1906" height="1191" alt="Group 45" src="https://github.com/user-attachments/assets/3a068a24-f2ee-45a6-8b0b-f8666e2a6bf7" />


### Utilisation heatmap

One row per person, one square per week. Yellow means under 40% (not enough work), green goes up to 100%, and red means over capacity.

[Open the Team page](https://margin-hub-tau.vercel.app/team)

<img width="1922" height="1191" alt="Group 46" src="https://github.com/user-attachments/assets/9130ecf0-f525-4986-9a0a-d4c4de485b1c" />

## UI and UX

Built for agency owners, managers and freelancers who want one clear source of truth.

The design is meant to be easy to pick up and direct. A lot of analytics tools, like Semrush, take time to learn: you click through different pages and menus to find each number, and using them becomes a skill of its own. Margin Hub works the other way. There are only four pages, Overview, Team, Services and Clients, and each one puts the important numbers on a single screen. There's nothing to learn, so you can be comfortable with it from day one. Charts and colour do most of the talking, so there's a lot of information without it feeling like too much.

- **Red only means a problem.** Losses, unprofit, overloaded people and late invoices are red.
- **Every number shows its time period.** Each card says whether it covers 3 months, all time or this month, so you always know what you’re looking at.
- **The period is always visible.** I used buttons instead of a dropdown, so you can see which period is selected.
- **Each service keeps its colour.** SEO, CRO, Paid Ads and the rest use the same colour on every chart and table.
- **Patterns first, numbers second.** The heatmap and burn bars show trouble before you read a single number.
- **Key details sit next to the name.** Tier and status tags sit beside each client, so you don’t have to look anything up.
