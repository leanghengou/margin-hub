select clients.name, industry, services.name as service,budget, pricing_model, location, email from clients join projects on clients.id = projects.client_id join services on projects.service_id = services.id;






----------Employee and project table------------
select 
concat(first_name, ' ', last_name) as employee_name, 
services.name as service,
projects.pricing_model as pricing_model,
clients.name as client,
sum(hour_spent) as hour_spent,
employee_rates.hourly_cost,
work_date


from time_entries 
join employees 
on time_entries.employee_id = employees.id
join services
on time_entries.service_id = services.id
join clients
on time_entries.client_id = clients.id
join projects
on time_entries.project_id = projects.id
join employee_rates 
on employees.id = employee_rates.employee_id

group by first_name, last_name, services.name, projects.pricing_model, clients.name, work_date, employee_rates.hourly_cost
order by work_date

;

----------End Employee and project table------------










---------Object one---------

 select 

employees.id as employee_id, 
concat(first_name, ' ', last_name) as employee_name, 
services.id as service_id,
services.name as service,
projects.pricing_model as pricing_model,
clients.id as client_id,
clients.name as client,
hour_spent,
employee_rates.hourly_cost,
employee_rates.id as employee_rate_id,
time_entries.id as time_entries_id,
round(employee_rates.hourly_cost * hour_spent, 2) as labour_cost,
billable,
work_date


from time_entries 
join employees 
on time_entries.employee_id = employees.id
join services
on time_entries.service_id = services.id
join clients
on time_entries.client_id = clients.id
join projects
on time_entries.project_id = projects.id
join employee_rates 
on employees.id = employee_rates.employee_id
and work_date >= employee_rates.valid_from and 
(employee_rates.valid_to is null or work_date <= employee_rates.valid_to)



;

----------------------------
















select
entry_view.client,
entry_view.client_id,
entry_view.service,
sum(entry_view.labour_cost) as labour_cost,
sum(pay.amount),
to_char(entry_view.work_date, 'YYYY-MM') AS work_month,
to_char(pay.invoice_date, 'YYYY-MM') AS invoice_month

from v_entry_cost entry_view

join invoices pay on 
entry_view.service_id = pay.service_id
and 
entry_view.client_id = pay.client_id
and 
to_char(entry_view.work_date, 'YYYY-MM') = to_char(pay.invoice_date, 'YYYY-MM')

group by entry_view.client_id, entry_view.client, entry_view.service, work_month, invoice_month

order by work_month
;












with revenue as (          
    select
		service_id,
        client_id,
        to_char(invoice_date, 'YYYY-MM') as month,
        sum(amount) as total_cost
    from invoices
    group by client_id, to_char(invoice_date, 'YYYY-MM'), service_id
	order by client_id, to_char(invoice_date, 'YYYY-MM')
	)


select * from revenue;










---------2nd view---------------------


with monthly_revenue as (          
    select
		service_id,
        client_id,
        to_char(invoice_date, 'YYYY-MM') as month,
        sum(amount) as total_revenue
    from invoices
    group by client_id, to_char(invoice_date, 'YYYY-MM'), service_id
	order by client_id, to_char(invoice_date, 'YYYY-MM')
)


select
agency.client,
agency.client_id,
agency.service,
agency.service_id,
sum(agency.labour_cost) as labour_cost,
client_revenue.total_revenue as revenue,
(client_revenue.total_revenue - sum(agency.labour_cost)) as profit,
to_char(agency.work_date, 'YYYY-MM') AS work_month
from v_entry_cost agency
join monthly_revenue client_revenue
on agency.client_id = client_revenue.client_id
and agency.service_id = client_revenue.service_id
and to_char(agency.work_date, 'YYYY-MM') = client_revenue.month

group by agency.client_id, agency.client, agency.service, work_month, revenue, agency.service_id
order by work_month
;






---------3rd view---------------------
select 
service_id,
service,
work_month,
sum(labour_cost) as labour_cost,
 sum(revenue) as revenue,
 sum(profit) as profit,
 round(sum(profit) / nullif(sum(revenue), 0), 3) as margin

from V_client_month_pnl

group by work_month,service_id,service
;