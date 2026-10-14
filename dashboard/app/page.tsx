import sql from "../lib/db"
export const dynamic = 'force-dynamic'
// const rows = await sql`select * from clients`

export default async function Home() {

const serviceMonthPnl= await 
sql`select  
sum(revenue) as current_month_revenue,
to_char(current_date, 'Mon') as month
from v_service_month_pnl
where work_month = to_char(current_date, 'YYYY-MM')`


const grossProfitSql = await sql`
select  
sum(revenue - labour_cost) as gross_profit,
to_char(current_date, 'Mon') as month
from v_service_month_pnl
where work_month = to_char(current_date, 'YYYY-MM')
;
`


const marginSql = await sql`
select  
sum(profit) / nullif(sum(revenue), 0) as margin
from v_service_month_pnl
where work_month = to_char(current_date, 'YYYY-MM')
;
`


const totalRevenueSql = await sql`
select  
sum(revenue) as total_revenue
from v_service_month_pnl
;`


const grossProfitTwoYearsSql = await sql`
select  
round(sum(revenue) - sum(labour_cost)) as gross_profit
from v_service_month_pnl
;`


const clientStatus = await sql`
WITH client_financials AS (
select 
client_id,
case when sum(revenue) - sum(labour_cost) < 0 then null else 
sum(revenue) - sum(labour_cost) end as profit
from v_client_month_pnl
group by client_id)
select  
count(case when client_table.end_date is null then 1 end) as active_clients,
count(case when client_table.end_date is not null then 1 end) as churned_clients,
count(case when client_profit.profit is null then 1 end) as client_no_profit
from clients client_table
join client_financials client_profit on client_table.id = client_profit.client_id
;`


const currentMonth = serviceMonthPnl[0].month;
const currentMonthlyRevenue = new Intl.NumberFormat('en-US', {
style: 'currency',
currency: 'USD',
notation: 'compact',
maximumFractionDigits: 2
}).format(serviceMonthPnl[0].current_month_revenue)






const grossProfit = new Intl.NumberFormat('en-US', {
style: 'currency',
currency: 'USD',
notation: 'compact',
maximumFractionDigits: 2
}).format(grossProfitSql[0].gross_profit)

const profitMargin = marginSql[0].margin
const allYearsRevenue = new Intl.NumberFormat('en-US', {
style: 'currency',
currency: 'USD',
notation: 'compact',
maximumFractionDigits: 2
}).format(totalRevenueSql[0].total_revenue)

const grossProfitTwoYears = new Intl.NumberFormat('en-US', {
style: 'currency',
currency: 'USD',
notation: 'compact',
maximumFractionDigits: 2
}).format(grossProfitTwoYearsSql[0].gross_profit)





console.log("Monthly Revenue", clientStatus)
  return(

    <section className="flex flex-row">
      <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink text-[0.7rem] font-medium">Revenue - {currentMonth}</h5>
      <h3 className="text-ink text-[1.5rem] font-bold">{currentMonthlyRevenue}</h3>
      </div>

       <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink text-[0.7rem] font-medium">Gross Profit - {currentMonth}</h5>
      <h3 className="text-ink text-[1.5rem] font-bold">{grossProfit}</h3>
      </div>

       <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink text-[0.7rem] font-medium">Margin - {currentMonth}</h5>
      <h3 className="text-ink text-[1.5rem] font-bold">{Number(profitMargin).toFixed(2)}%</h3>
      </div>


       <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink  text-[0.7rem] font-medium">Revenue - 24 Month</h5>
      <h3 className="text-ink text-[1.5rem] font-bold">{allYearsRevenue}</h3>
      </div>

       <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink  text-[0.7rem] font-medium">Gross Profit - 24 Month</h5>
      <h3 className="text-ink text-[1.5rem] font-bold">{grossProfitTwoYears}</h3>
      </div>

       <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink text-[0.7rem] font-medium">Clients</h5>
      <h3 className="text-ink text-[1.5rem] font-bold p-0">{clientStatus[0].active_clients} <span className="text-[0.7rem]">active</span></h3>
      <p className="text-ink text-[0.7rem] font-medium mt-0">{clientStatus[0].churned_clients} churned - <span className="text-red">{clientStatus[0].client_no_profit} losing money</span></p>
      </div>

   
    </section>
  )
}