import sql from "./db";



const compactUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

// postgres.js returns SUM results as strings, so convert first
export const formatMoney = (n: number | string | null) =>
  n == null ? "—" : compactUsd.format(Number(n));

/* ---------- All queries ---------- */
export async function getKpis(months:number) {
  const [row] = await sql`
    WITH bounds AS (
      SELECT
        to_char(current_date - INTERVAL '1 month', 'YYYY-MM') AS current_month,
        to_char(current_date - make_interval(months => 2), 'YYYY-MM') AS last_month
    ),
    totals AS (
      SELECT
        SUM(this_month.revenue) FILTER (WHERE this_month.work_month = b.current_month) AS current_month_revenue,
        SUM(this_month.profit)  FILTER (WHERE this_month.work_month = b.current_month) AS current_month_profit,
		SUM(this_month.revenue)  FILTER (WHERE this_month.work_month = b.last_month) AS last_month_revenue,
		SUM(this_month.profit)  FILTER (WHERE this_month.work_month = b.last_month) AS last_month_profit,
		b.current_month as current_month,
		b.last_month as last_month
      FROM v_service_month_pnl this_month, bounds b
      WHERE this_month.work_month BETWEEN b.last_month AND b.current_month
	  GROUP BY b.current_month, b.last_month
    )
    SELECT
      to_char(to_date(current_month, 'YYYY-MM'), 'Mon') AS current_month_label,
      current_month_revenue,
      current_month_profit,
	  ROUND(100.0 * current_month_profit / NULLIF(current_month_revenue, 0), 1) AS current_avg_margin,
	 to_char(to_date(last_month, 'YYYY-MM'), 'Mon') AS last_month_label,
	  last_month_revenue,
	  last_month_profit,
	  ROUND(100.0 * last_month_profit / NULLIF(last_month_revenue, 0), 1) AS last_avg_margin,

      ROUND(100.0 * last_month_profit / NULLIF(last_month_revenue, 0), 1) AS last_avg_margin,
  ROUND(100.0 * (current_month_revenue - last_month_revenue) / NULLIF(last_month_revenue, 0), 1) AS revenue_mom,
  ROUND(100.0 * (current_month_profit - last_month_profit) / NULLIF(ABS(last_month_profit), 0), 1) AS profit_mom,
  ROUND(100.0 * current_month_profit / NULLIF(current_month_revenue, 0)
      - 100.0 * last_month_profit / NULLIF(last_month_revenue, 0), 1) AS margin_mom_pts
    FROM totals
  ;
  `;
  return row;
}





export async function getClientStatus() {
  const [row] = await sql`
    WITH client_profit AS (
      SELECT client_id, SUM(profit) AS profit
      FROM v_client_month_pnl
      GROUP BY client_id
    )
    SELECT
      COUNT(*) FILTER (WHERE c.end_date IS NULL)     AS active_clients,
      COUNT(*) FILTER (WHERE c.end_date IS NOT NULL) AS churned_clients,
      COUNT(*) FILTER (WHERE cp.profit < 0)          AS losing_money
    FROM clients c
    LEFT JOIN client_profit cp ON cp.client_id = c.id
  `;
  return row;
}


export async function getBudgetBurn() {
  return sql`
    SELECT client, service, budgeted_hour, hours_spent_by_team
    FROM v_budget_burn
    WHERE budget_month = date_trunc('month', current_date)::date
  `;
}





export async function getClientTables(months:number) {
  return sql`

WITH selected_month AS (
      SELECT
        to_char(current_date - INTERVAL '1 month', 'YYYY-MM') AS last_month,
        to_char(current_date - make_interval(months => ${months}), 'YYYY-MM') AS first_month
    ),

totals_table AS (
select
table_client.client,
table_client.client_id,
sum(table_client.revenue) as revenue,
sum(table_client.revenue) - sum(table_client.labour_cost) as gross_profit,
round(100.0 * sum(table_client.profit) / nullif(sum(table_client.revenue), 0),1) as margin_pct
from v_client_month_pnl table_client, selected_month bounds
WHERE work_month BETWEEN bounds.first_month AND bounds.last_month
group by table_client.client, table_client.client_id
)

select
totals_table.*
from totals_table
order by gross_profit desc
;
  `;
}




export async function getAgencyTrend(months:number) {
  return sql`
WITH selected_month AS (
      SELECT
        to_char(current_date - INTERVAL '1 month', 'YYYY-MM') AS last_month,
        to_char(current_date - make_interval(months => ${months}), 'YYYY-MM') AS first_month
    )

    SELECT
revenue_trend.work_month,
SUM(revenue_trend.revenue) AS revenue,
SUM(revenue_trend.profit) AS profit
FROM v_client_month_pnl revenue_trend, selected_month bound_month

WHERE work_month BETWEEN bound_month.first_month AND bound_month.last_month
GROUP BY work_month
ORDER BY work_month;
  `;
}





export async function getServiceMix() {
return sql`
SELECT
service,
SUM(revenue) AS revenue,
SUM(labour_cost) AS cost,
SUM(profit) AS profit,
to_char(current_date, 'YYYY') AS selected_year,
to_char(current_date, 'FMMonth') AS selected_month
FROM v_service_month_pnl
WHERE work_month >= to_char(date_trunc('year', current_date), 'YYYY-MM')
AND work_month <= to_char(current_date, 'YYYY-MM')
GROUP BY service
ORDER BY revenue DESC;
`;
}


export async function getClientDetail(client : number) {
  return sql`
  SELECT
  client_info.client,
  clients.tier,
  clients.email,
  clients.location,
  to_char(clients.start_date, 'Mon YYYY') AS joined,
  COALESCE(to_char(clients.end_date, 'Mon YYYY'), 'Active') AS ended,
  client_info.work_month,
  client_info.service,
  client_info.revenue,
  client_info.labour_cost,
  client_info.profit,
  ROUND(100.0 * client_info.profit / NULLIF(client_info.revenue, 0), 1) AS margin_pct,
  invoices.id AS invoice_id,
  invoices.invoice_date,
  invoices.amount AS invoiced,
  invoices.is_paid,
  invoices.paid_date,
  cb.budgeted_hour,
  cb.monthly_fee

from v_client_month_pnl client_info 
left join invoices on invoices.client_id = client_info.client_id
and invoices.service_id = client_info.service_id
and to_char(invoices.invoice_date, 'YYYY-MM') = client_info.work_month
left join clients on client_info.client_id = clients.id
left join client_budgets cb
on to_char(cb.month, 'YYYY-MM') = client_info.work_month
and cb.service_id = client_info.service_id
and cb.client_id = client_info.client_id
where client_info.client_id = ${client}
order by client_info.work_month
;
  `
}


export async function getEmployeeUtilisation() {
  return sql`
 WITH bounds AS (
   SELECT date_trunc('week', current_date)::date AS latest_week
    )

select  employee_name, 
employee_id,
array_agg(utilisation ORDER BY week) AS weeks,
array_agg(to_char(week, 'Mon') ORDER BY week) AS months
from 
v_employee_utilisation employee, bounds work_month

where 
employee.week < work_month.latest_week
and employee.week >= date_trunc('year', work_month.latest_week)
GROUP BY employee_id, employee_name
ORDER BY employee_name
;
  `
}

export async function getTeamEconomic(customValue:number) {

  return sql`
  WITH bounds AS (
  SELECT date_trunc('month', MAX(work_date))::date AS partial_month
  FROM time_entries
)
SELECT
  t.team_id,
  t.team,
  SUM(t.total_revenue) AS revenue,
  SUM(t.hours_spent)   AS hours,
  ROUND(SUM(t.total_revenue) / NULLIF(SUM(t.hours_spent), 0)) AS rate
FROM v_team_performance t, bounds b
WHERE to_date(left(t.month, 7), 'YYYY-MM') <  b.partial_month
  AND to_date(left(t.month, 7), 'YYYY-MM') >= b.partial_month - make_interval(months => ${customValue})
GROUP BY t.team_id, t.team
ORDER BY rate DESC NULLS LAST;
  `
  
}


export async function getWorkerUtilisation(){
  return sql`
WITH bounds AS (
SELECT MAX(week) AS latest_week -- ONE row: last week in the data
FROM v_employee_utilisation
)
SELECT
u.employee_id,
u.employee_name,
t.name AS team,
r.hourly_cost AS current_rate, -- rate valid in the latest week
round(SUM(u.billable_hours) / COUNT(*), 1) AS hours_per_week,
round(100 * SUM(u.billable_hours) / NULLIF(SUM(u.weekly_capacity), 0)) AS worker_utilisation
FROM v_employee_utilisation u
JOIN employees e ON e.id = u.employee_id
JOIN teams t ON t.id = e.team_id
CROSS JOIN bounds b
LEFT JOIN employee_rates r
ON r.employee_id = u.employee_id
AND r.valid_from <= b.latest_week
AND (r.valid_to IS NULL OR r.valid_to >= b.latest_week)
WHERE u.week > b.latest_week - INTERVAL '4 weeks'
AND u.week <= b.latest_week
GROUP BY u.employee_id, u.employee_name, t.name, r.hourly_cost
ORDER BY worker_utilisation DESC
  `
}


export async function getTeamLoggedHour(months:number){
  return sql`
WITH monthly AS (
SELECT
to_date(month, 'YYYY-MM') AS month,
team,
hours_spent
FROM v_team_performance
),
bounds AS (
SELECT MAX(month) AS latest_month FROM monthly
)
SELECT
to_char(m.month, 'Mon ''YY') AS label,
COALESCE(SUM(m.hours_spent) FILTER (WHERE m.team = 'SEO'), 0) AS seo,
COALESCE(SUM(m.hours_spent) FILTER (WHERE m.team = 'Paid Ads'), 0) AS paid_ads,
COALESCE(SUM(m.hours_spent) FILTER (WHERE m.team = 'Website'), 0) AS website
FROM monthly m
CROSS JOIN bounds b
WHERE m.month < b.latest_month 
AND m.month >= date_trunc('year', b.latest_month) 
GROUP BY m.month
ORDER BY m.month;
  `
}






export async function getTeamLoggedMargin(months: number) {
return sql`
WITH bounds AS (
SELECT date_trunc('month', MAX(work_date))::date AS latest_month
FROM v_entry_cost
),
cost AS (
SELECT s.team_id,
SUM(c.labour_cost) AS labour_cost,
SUM(c.hour_spent) AS hours
FROM v_entry_cost c
JOIN services s ON s.id = c.service_id
CROSS JOIN bounds b
WHERE c.work_date >= b.latest_month - make_interval(months => ${months})
AND c.work_date < b.latest_month
GROUP BY s.team_id
),
revenue AS (
SELECT s.team_id, SUM(i.amount) AS revenue
FROM invoices i
JOIN services s ON s.id = i.service_id
CROSS JOIN bounds b
WHERE i.invoice_date >= b.latest_month - make_interval(months => ${months})
AND i.invoice_date< b.latest_month
GROUP BY s.team_id
)
SELECT
t.name AS team,
r.revenue,
c.labour_cost,
r.revenue - c.labour_cost AS gross_profit,
round(100 * (r.revenue - c.labour_cost) / NULLIF(r.revenue, 0), 1) AS margin_pct,
round((r.revenue - c.labour_cost) / NULLIF(c.hours, 0)) AS profit_per_hour
FROM teams t
JOIN cost c ON c.team_id = t.id
JOIN revenue r ON r.team_id = t.id
ORDER BY margin_pct DESC;
`}



export async function getAeoServiceMonthly() {
return sql`
select 
service,
sum(labour_cost) as labour_cost,
sum(revenue) as montly_revenue,
sum(profit) as monthly_profit,
sum(ROUND(100 * (revenue - labour_cost) / NULLIF(revenue, 0), 1)) AS margin_pct,
work_month
from v_client_month_pnl
where work_month BETWEEN TO_CHAR(date_trunc('year',current_date), 'YYYY-MM') and TO_CHAR(current_date, 'YYYY-MM')
group by service, work_month;
`}


