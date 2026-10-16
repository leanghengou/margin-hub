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






