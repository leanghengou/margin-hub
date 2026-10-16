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
        to_char(current_date - INTERVAL '1 month', 'YYYY-MM') AS last_month,
        to_char(current_date - make_interval(months => ${months}), 'YYYY-MM') AS first_month
    ),
    totals AS (
      SELECT
        SUM(revenue) FILTER (WHERE work_month = b.last_month) AS month_revenue,
        SUM(profit)  FILTER (WHERE work_month = b.last_month) AS month_profit,
        SUM(revenue) AS total_revenue,
        SUM(profit)  AS total_profit
      FROM v_service_month_pnl, bounds b
      WHERE work_month BETWEEN b.first_month AND b.last_month
    )
    SELECT
      to_char(current_date - INTERVAL '1 month', 'Mon') AS month_label,
      month_revenue,
      month_profit,
      ROUND(100.0 * month_profit / NULLIF(month_revenue, 0), 1) AS month_margin,
      total_revenue,
      total_profit,
      ROUND(100.0 * total_profit / NULLIF(total_revenue, 0), 1) AS avg_margin
    FROM totals
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




export async function getAgencyTrend() {
  return sql`
    SELECT
work_month,
SUM(revenue) AS revenue,
SUM(profit) AS profit
FROM v_client_month_pnl
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