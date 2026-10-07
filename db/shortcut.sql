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