-- Loads CSV data into the database. Safe to re-run:
-- it clears each table and rebuilds it from the CSVs.
BEGIN;

-- teams
TRUNCATE teams RESTART IDENTITY CASCADE;
\copy teams (id, name) FROM 'data/teams.csv' WITH (FORMAT csv, HEADER true);
SELECT setval('teams_id_seq', (SELECT MAX(id) FROM teams));

-- clients
TRUNCATE clients RESTART IDENTITY CASCADE;
\copy clients (id, name, industry, start_date, end_date, tier, location, email) FROM 'data/clients.csv' WITH (FORMAT csv, HEADER true);
SELECT setval('clients_id_seq', (SELECT MAX(id) FROM clients));

-- dim_date: built here with generate_series, one row per day.
TRUNCATE dim_date CASCADE;
INSERT INTO dim_date (date, month, quarter, year, is_workday)
SELECT
  d::date,
    EXTRACT(month FROM d)::int,
  EXTRACT(quarter FROM d)::int,
  EXTRACT(year FROM d)::int,
  EXTRACT(isodow FROM d) < 6
FROM generate_series('2025-01-01'::date, '2026-12-31'::date, '1 day') AS d;

-- services
TRUNCATE services RESTART IDENTITY CASCADE;
\copy services (id, name, team_id, bill_rate) FROM 'data/services.csv' WITH (FORMAT csv, HEADER true);
SELECT setval('services_id_seq', (SELECT MAX(id) FROM services));

-- employees
TRUNCATE employees RESTART IDENTITY CASCADE;
\copy employees (id, first_name, last_name, team_id, created_at, weekly_capacity) FROM 'data/employees.csv' WITH (FORMAT csv, HEADER true);
SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees));

-- employee_rates
TRUNCATE employee_rates RESTART IDENTITY CASCADE;
\copy employee_rates (id, hourly_cost, employee_id, valid_from, valid_to) FROM 'data/employee_rates.csv' WITH (FORMAT csv, HEADER true);
SELECT setval('employee_rates_id_seq', (SELECT MAX(id) FROM employee_rates));

-- projects
TRUNCATE projects RESTART IDENTITY CASCADE;
\copy projects (id, budget, service_id, client_id, start_date, deadline, pricing_model) FROM 'data/projects.csv' WITH (FORMAT csv, HEADER true);
SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));

-- client_budgets
TRUNCATE client_budgets RESTART IDENTITY CASCADE;
\copy client_budgets (id, client_id, service_id, month, budgeted_hour, monthly_fee) FROM 'data/client_budgets.csv' WITH (FORMAT csv, HEADER true);
SELECT setval('client_budgets_id_seq', (SELECT MAX(id) FROM client_budgets));
-- invoices
TRUNCATE invoices RESTART IDENTITY CASCADE;
\copy invoices (id, client_id, service_id, invoice_date, amount, is_paid, paid_date) FROM 'data/invoices.csv' WITH (FORMAT csv, HEADER true);
SELECT setval('invoices_id_seq', (SELECT MAX(id) FROM invoices));

-- time_entries
TRUNCATE time_entries RESTART IDENTITY CASCADE;
\copy time_entries (id, employee_id, client_id, service_id, project_id, hour_spent, billable, work_date) FROM 'data/time_entries.csv' WITH (FORMAT csv, HEADER true);
SELECT setval('time_entries_id_seq', (SELECT MAX(id) FROM time_entries));

COMMIT;

-- Row counts so you can see what landed.
SELECT 'teams' AS table_name, COUNT(*) FROM teams
UNION ALL SELECT 'clients', COUNT(*) FROM clients
UNION ALL SELECT 'dim_date', COUNT(*) FROM dim_date
UNION ALL SELECT 'services', COUNT(*) FROM services
UNION ALL SELECT 'employees', COUNT(*) FROM employees
UNION ALL SELECT 'employee_rates', COUNT(*) FROM employee_rates
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'client_budgets', COUNT(*) FROM client_budgets
UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL SELECT 'time_entries', COUNT(*) FROM time_entries;
