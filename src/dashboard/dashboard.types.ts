import { Expense } from '../schemas/expense.schema';

/** Gasto agrupado por categoría (gráfica de dona). */
export interface CategoryBreakdown {
  category_id: string;
  category_name: string; // nombre en inglés tal cual está en la colección
  total: number;
  count: number;
  percentage: number;
}

/** Un punto de la gráfica de evolución mensual. */
export interface MonthlyTrendPoint {
  year: number;
  month: number;
  income: number;
  expenses: number;
  balance: number;
}

export interface DebtsSummary {
  count: number;
  total_amount: number;
  remaining_amount: number;
  paid_amount: number;
  paid_percentage: number;
  paid_this_month: number;
}

export interface SavingsSummary {
  count: number;
  target_amount: number;
  current_amount: number;
  progress_percentage: number;
  saved_this_month: number;
}

/** Respuesta de GET /dashboard/summary (interfaz DashboardSummary del frontend). */
export interface DashboardSummary {
  year: number;
  month: number;
  income: number;
  total_expenses: number;
  balance: number;
  spent_percentage: number;
  expense_count: number;
  by_category: CategoryBreakdown[];
  trend: MonthlyTrendPoint[];
  debts: DebtsSummary;
  savings: SavingsSummary;
  top_expenses: Expense[];
}
