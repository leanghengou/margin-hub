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
   WITH months AS (
      -- Every month from the client's start to today (or their end date)...
      SELECT to_char(m, 'YYYY-MM') AS work_month
      FROM clients c
      CROSS JOIN generate_series(
        date_trunc('month', c.start_date),
        date_trunc('month', COALESCE(c.end_date, current_date)),
        INTERVAL '1 month'
      ) AS m
      WHERE c.id = ${client}

      UNION

      -- ...plus any month with an invoice (e.g. a final bill after churn), never in the future
      SELECT to_char(invoice_date, 'YYYY-MM')
      FROM invoices
      WHERE client_id = ${client}
        AND invoice_date <= current_date
    ),

    monthly_invoices AS (
      -- Revenue: one row per service per month, straight from invoices
      SELECT
        service_id,
        to_char(invoice_date, 'YYYY-MM') AS work_month,
        MIN(id)           AS invoice_id,
        MIN(invoice_date) AS invoice_date,
        SUM(amount)       AS invoiced,
        BOOL_AND(is_paid) AS is_paid,
        MAX(paid_date)    AS paid_date
      FROM invoices
      WHERE client_id = ${client}
        AND invoice_date <= current_date
      GROUP BY service_id, to_char(invoice_date, 'YYYY-MM')
    ),

    monthly_cost AS (
      -- Cost: logged hours priced at the rate valid on each work date
      SELECT
        service_id,
        to_char(work_date, 'YYYY-MM') AS work_month,
        SUM(labour_cost) AS labour_cost
      FROM v_entry_cost
      WHERE client_id = ${client}
      GROUP BY service_id, to_char(work_date, 'YYYY-MM')
    ),

    services_used AS (
      SELECT service_id FROM monthly_invoices
      UNION
      SELECT service_id FROM monthly_cost
    )

    SELECT
      c.name AS client,
      c.tier,
      c.email,
      c.location,
      to_char(c.start_date, 'Mon YYYY') AS joined,
      COALESCE(to_char(c.end_date, 'Mon YYYY'), 'Active') AS ended,
      m.work_month,
      s.name AS service,
      COALESCE(i.invoiced, 0)::float8     AS revenue,
      COALESCE(mc.labour_cost, 0)::float8 AS labour_cost,
      (COALESCE(i.invoiced, 0) - COALESCE(mc.labour_cost, 0))::float8 AS profit,
      ROUND(100.0 * (COALESCE(i.invoiced, 0) - COALESCE(mc.labour_cost, 0))
            / NULLIF(i.invoiced, 0), 1)::float8 AS margin_pct,
      i.invoice_id,
      i.invoice_date,
      i.invoiced,
      i.is_paid,
      i.paid_date,
      cb.budgeted_hour,
      cb.monthly_fee

    FROM months m
    CROSS JOIN services_used su
    JOIN services s ON s.id = su.service_id
    JOIN clients c  ON c.id = ${client}
    LEFT JOIN monthly_invoices i
      ON i.service_id = su.service_id
     AND i.work_month = m.work_month
    LEFT JOIN monthly_cost mc
      ON mc.service_id = su.service_id
     AND mc.work_month = m.work_month
    LEFT JOIN client_budgets cb
      ON cb.client_id  = ${client}
     AND cb.service_id = su.service_id
     AND to_char(cb.month, 'YYYY-MM') = m.work_month

    -- Drop empty combinations, e.g. a one-off service in months it wasn't sold
    WHERE i.invoice_id IS NOT NULL
       OR mc.labour_cost IS NOT NULL
       OR cb.client_id IS NOT NULL

    ORDER BY m.work_month, s.name;
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




export async function getServiceLinePnl() {
  return sql`
    WITH bounds AS (
      -- Last 12 full months, anchored to the data (Oct '26 is partial, so excluded)
      SELECT
        date_trunc('month', MAX(work_date)) - INTERVAL '12 months' AS start_date,
        date_trunc('month', MAX(work_date))                        AS end_date  -- exclusive
      FROM v_entry_cost
    ),
    revenue AS (
      -- Revenue per service (invoices, via the P&L view)
      SELECT
        p.service,
        SUM(p.revenue) AS revenue
      FROM v_client_month_pnl p
      CROSS JOIN bounds b
      WHERE p.work_month >= to_char(b.start_date, 'YYYY-MM')
        AND p.work_month <  to_char(b.end_date,   'YYYY-MM')
      GROUP BY p.service
    ),
    work AS (
      -- Hours AND labour cost from every time entry,
      -- so months without an invoice still carry their cost
      SELECT
        e.service,
        SUM(e.hour_spent)  AS hours,
        SUM(e.labour_cost) AS labour_cost
      FROM v_entry_cost e
      CROSS JOIN bounds b
      WHERE e.work_date >= b.start_date
        AND e.work_date <  b.end_date
      GROUP BY e.service
    ),
    pnl AS (
      -- FULL JOIN keeps a service even if it has only revenue or only hours
      SELECT
        COALESCE(w.service, r.service)                        AS service,
        COALESCE(r.revenue, 0)                                AS revenue,
        COALESCE(w.labour_cost, 0)                            AS labour_cost,
        COALESCE(r.revenue, 0) - COALESCE(w.labour_cost, 0)   AS profit,
        COALESCE(w.hours, 0)                                  AS hours
      FROM work w
      FULL JOIN revenue r ON r.service = w.service
    )
    SELECT
      service,
      revenue,
      profit                                                      AS gross_profit,
      ROUND(100 * profit  / NULLIF(revenue, 0), 1)                AS margin_pct,
      -- Window function: each service's share of total revenue
      ROUND(100 * revenue / NULLIF(SUM(revenue) OVER (), 0), 1)   AS revenue_share,
      ROUND(revenue     / NULLIF(hours, 0))                       AS rate_per_hour,
      ROUND(labour_cost / NULLIF(hours, 0))                       AS cost_per_hour,
      ROUND(profit      / NULLIF(hours, 0))                       AS profit_per_hour
    FROM pnl
    ORDER BY revenue DESC;
  `;
}

export async function getClientListTable (){

  return sql`
  
  select 
client,
c.tier,
c.industry,
case when c.end_date is null then 'Active' else 'Churned' end as status,
c.start_date as joined,
case when c.end_date is null then '--' else c.end_date::text end as ended,
sum(revenue) as lifetime_revenue,
sum(revenue) -sum(labour_cost)  as lifetime_gp,
ROUND(100 * (SUM(revenue) - SUM(labour_cost)) / NULLIF(SUM(revenue), 0), 1) AS margin_pct

from v_client_month_pnl client_info
join clients c on c.id = client_info.client_id

group by client, c.id
;
  `
}


export async function getInvoiceTable(){
  return sql`
   select
inv.id,
c.name as client,
s.name as service,
to_char(inv.invoice_date, 'Mon DD, YYYY') as invoice_date,
sum(amount) as amount,
inv.is_paid,
current_date - inv.invoice_date as days_since_invoice
from 
invoices inv
join clients c on c.id = inv.client_id
join services s on s.id = inv.service_id
where is_paid = false and invoice_date < current_date
group by c.name, s.name, inv.invoice_date, inv.is_paid, inv.id
;
  `
}


export async function getRevenueByTier() {
  return sql`
  select 
c.tier,
count(distinct vc.client) as clients,
sum(vc.revenue) as revenue,
sum(vc.profit) as gross_profit,
round(100 * sum(vc.profit) / nullif(sum(vc.revenue), 0), 1)::float8 as margin_pct
from v_client_month_pnl vc
join clients c on c.id = vc.client_id
group by c.tier
;
  `
}
export async function getRevenueIndustry() {
  return sql`
select 
c.industry,
count(distinct vc.client) as clients,
sum(vc.revenue) as revenue,
sum(vc.profit) as gross_profit,
round(100 * sum(vc.profit) / nullif(sum(vc.revenue), 0), 1)::float8 as margin_pct
from v_client_month_pnl vc
join clients c on c.id = vc.client_id
group by c.industry
;
  `
}