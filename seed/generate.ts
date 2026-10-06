import { generateTeams } from "./tables/teams.js";
import { generateClients } from "./tables/clients.js";
import { generateServices } from "./tables/services.js";
import { generateEmployees } from "./tables/employees.js";
import { generateEmployeeRates } from "./tables/employee_rates.js";
import { generateProjects } from "./tables/projects.js";
import { generateClientBudgets } from "./tables/client_budgets.js";
import { generateInvoices } from "./tables/invoices.js";
import { generateTimeEntries } from "./tables/time_entries.js";

// Runs each table generator in load order.
// We'll add more tables here as we build them.
console.log("Generating seed data...");

generateTeams();
generateClients();
generateServices();
generateEmployees();
generateEmployeeRates();
generateProjects();
generateClientBudgets();
generateInvoices();
generateTimeEntries();

console.log("Done.");