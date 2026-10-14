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

const currentMonthlyRevenue = serviceMonthPnl[0]
const grossProfit = grossProfitSql[0]
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

console.log("Monthly Revenue", grossProfitSql[0])
  return(

    <section className="flex flex-row">
      <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink uppercase text-[0.7rem] font-medium">Revenue - {currentMonthlyRevenue.month}</h5>
      <h3 className="text-ink text-[1.5rem] font-bold">{currentMonthlyRevenue.current_month_revenue}</h3>
      </div>

       <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink uppercase text-[0.7rem] font-medium">Gross Profit - {grossProfit.month}</h5>
      <h3 className="text-ink text-[1.5rem] font-bold">{grossProfit.gross_profit}</h3>
      </div>

       <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink uppercase text-[0.7rem] font-medium">Margin - {currentMonthlyRevenue.month}</h5>
      <h3 className="text-ink text-[1.5rem] font-bold">{Number(profitMargin).toFixed(2)}%</h3>
      </div>


       <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink uppercase text-[0.7rem] font-medium">Revenue - 24 Month</h5>
      <h3 className="text-ink text-[1.5rem] font-bold">{allYearsRevenue}</h3>
      </div>

       <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink uppercase text-[0.7rem] font-medium">Gross Profit - {currentMonthlyRevenue.month}</h5>
      <h3 className="text-ink text-[1.5rem] font-bold">{grossProfitTwoYears}</h3>
      </div>

       <div className="flex-1 overflow-hidden  bg-white shadow-md  p-2">
      <h5 className="text-ink uppercase text-[0.7rem] font-medium">Revenue - {currentMonthlyRevenue.month}</h5>
      <h3 className="text-ink text-[1.5rem] font-bold">{currentMonthlyRevenue.current_month_revenue}</h3>
      </div>


       
    </section>
  )
}