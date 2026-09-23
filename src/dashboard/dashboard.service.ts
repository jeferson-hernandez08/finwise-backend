import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense } from '../schemas/expense.schema';
import { ExpenseCategory } from '../schemas/expense-category.schema';
import { MonthlyIncome } from '../schemas/monthly-income.schema';
import { Debt } from '../schemas/debt.schema';
import { DebtPayment } from '../schemas/debt-payment.schema';
import { SavingsGoal } from '../schemas/savings-goal.schema';
import { SavingsContribution } from '../schemas/savings-contribution.schema';
import { lastMonths, monthRange } from '../common/date-range.util';
import {
  CategoryBreakdown,
  DashboardSummary,
  DebtsSummary,
  MonthlyTrendPoint,
  SavingsSummary,
} from './dashboard.types';

/** Meses que muestra la gráfica de evolución. */
const TREND_MONTHS = 6;

/** Porcentajes y montos se devuelven con un decimal. */
function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Porcentaje seguro: 0 cuando el total es 0 (evita NaN e Infinity). */
function percentage(part: number, total: number): number {
  if (!total) return 0;
  return round1((part / total) * 100);
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    @InjectModel(ExpenseCategory.name) private categoryModel: Model<ExpenseCategory>,
    @InjectModel(MonthlyIncome.name) private incomeModel: Model<MonthlyIncome>,
    @InjectModel(Debt.name) private debtModel: Model<Debt>,
    @InjectModel(DebtPayment.name) private debtPaymentModel: Model<DebtPayment>,
    @InjectModel(SavingsGoal.name) private savingsGoalModel: Model<SavingsGoal>,
    @InjectModel(SavingsContribution.name)
    private contributionModel: Model<SavingsContribution>,
  ) {}

  async summary(
    userId: string,
    year: number,
    month: number,
  ): Promise<DashboardSummary> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Usuario no válido');
    }
    const user = new Types.ObjectId(userId);
    const { start, end } = monthRange(year, month);

    // Consultas independientes: se lanzan a la vez.
    const [income, categoryRows, trend, debts, savings, topExpenses] =
      await Promise.all([
        this.monthIncome(user, year, month),
        this.expensesByCategory(user, start, end),
        this.monthlyTrend(user, year, month),
        this.debtsSummary(user, start, end),
        this.savingsSummary(user, start, end),
        this.topExpenses(user, start, end),
      ]);

    const totalExpenses = categoryRows.reduce((sum, row) => sum + row.total, 0);
    const expenseCount = categoryRows.reduce((sum, row) => sum + row.count, 0);

    const byCategory: CategoryBreakdown[] = categoryRows.map((row) => ({
      ...row,
      percentage: percentage(row.total, totalExpenses),
    }));

    return {
      year,
      month,
      income,
      total_expenses: totalExpenses,
      balance: income - totalExpenses,
      spent_percentage: percentage(totalExpenses, income),
      expense_count: expenseCount,
      by_category: byCategory,
      trend,
      debts,
      savings,
      top_expenses: topExpenses,
    };
  }

  // Ingreso fijo del mes; 0 si el usuario todavía no lo registró.
  private async monthIncome(
    user: Types.ObjectId,
    year: number,
    month: number,
  ): Promise<number> {
    const income = await this.incomeModel
      .findOne({ user_id: user, year, month })
      .select('amount')
      .exec();
    return income?.amount ?? 0;
  }

  // Gastos del mes agrupados por categoría, de mayor a menor.
  private async expensesByCategory(
    user: Types.ObjectId,
    start: Date,
    end: Date,
  ): Promise<Omit<CategoryBreakdown, 'percentage'>[]> {
    return this.expenseModel
      .aggregate<Omit<CategoryBreakdown, 'percentage'>>([
        { $match: { user_id: user, date: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: '$category_id',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: this.categoryModel.collection.name,
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $project: {
            _id: 0,
            category_id: { $ifNull: [{ $toString: '$_id' }, ''] },
            // Nombre en inglés: el frontend lo traduce.
            category_name: {
              $ifNull: [{ $arrayElemAt: ['$category.name', 0] }, 'Others'],
            },
            total: 1,
            count: 1,
          },
        },
        { $sort: { total: -1 } },
      ])
      .exec();
  }

  // Últimos 6 meses terminando en el pedido, en orden cronológico.
  private async monthlyTrend(
    user: Types.ObjectId,
    year: number,
    month: number,
  ): Promise<MonthlyTrendPoint[]> {
    const months = lastMonths(year, month, TREND_MONTHS);
    const first = months[0];
    const last = months[months.length - 1];
    const start = monthRange(first.year, first.month).start;
    const end = monthRange(last.year, last.month).end;

    const [expenseRows, incomeRows] = await Promise.all([
      this.expenseModel
        .aggregate<{ _id: { year: number; month: number }; total: number }>([
          { $match: { user_id: user, date: { $gte: start, $lte: end } } },
          {
            $group: {
              _id: { year: { $year: '$date' }, month: { $month: '$date' } },
              total: { $sum: '$amount' },
            },
          },
        ])
        .exec(),
      this.incomeModel
        .find({
          user_id: user,
          $or: months.map((m) => ({ year: m.year, month: m.month })),
        })
        .select('year month amount')
        .exec(),
    ]);

    const expensesByMonth = new Map<string, number>(
      expenseRows.map((row) => [`${row._id.year}-${row._id.month}`, row.total]),
    );
    const incomesByMonth = new Map<string, number>(
      incomeRows.map((row) => [`${row.year}-${row.month}`, row.amount]),
    );

    return months.map(({ year: y, month: m }) => {
      const key = `${y}-${m}`;
      const expenses = expensesByMonth.get(key) ?? 0;
      const income = incomesByMonth.get(key) ?? 0;
      return { year: y, month: m, income, expenses, balance: income - expenses };
    });
  }

  // Estado global de las deudas + lo pagado dentro del mes consultado.
  private async debtsSummary(
    user: Types.ObjectId,
    start: Date,
    end: Date,
  ): Promise<DebtsSummary> {
    const [row] = await this.debtModel
      .aggregate<{
        count: number;
        total_amount: number;
        remaining_amount: number;
        paid_this_month: number;
      }>([
        { $match: { user_id: user } },
        {
          // Pagos del mes de cada deuda, sin traerse los documentos a memoria.
          $lookup: {
            from: this.debtPaymentModel.collection.name,
            let: { debtId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$debt_id', '$$debtId'] },
                  payment_date: { $gte: start, $lte: end },
                },
              },
              { $group: { _id: null, total: { $sum: '$amount' } } },
            ],
            as: 'month_payments',
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            total_amount: { $sum: '$total_amount' },
            remaining_amount: { $sum: '$remaining_amount' },
            paid_this_month: {
              $sum: { $ifNull: [{ $arrayElemAt: ['$month_payments.total', 0] }, 0] },
            },
          },
        },
      ])
      .exec();

    const totalAmount = row?.total_amount ?? 0;
    const remaining = row?.remaining_amount ?? 0;
    const paid = totalAmount - remaining;

    return {
      count: row?.count ?? 0,
      total_amount: totalAmount,
      remaining_amount: remaining,
      paid_amount: paid,
      paid_percentage: percentage(paid, totalAmount),
      paid_this_month: row?.paid_this_month ?? 0,
    };
  }

  // Estado global de las metas de ahorro + lo aportado dentro del mes.
  private async savingsSummary(
    user: Types.ObjectId,
    start: Date,
    end: Date,
  ): Promise<SavingsSummary> {
    const [row] = await this.savingsGoalModel
      .aggregate<{
        count: number;
        target_amount: number;
        current_amount: number;
        saved_this_month: number;
      }>([
        { $match: { user_id: user } },
        {
          $lookup: {
            from: this.contributionModel.collection.name,
            let: { goalId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$savings_goal_id', '$$goalId'] },
                  date: { $gte: start, $lte: end },
                },
              },
              { $group: { _id: null, total: { $sum: '$amount' } } },
            ],
            as: 'month_contributions',
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            target_amount: { $sum: '$target_amount' },
            current_amount: { $sum: '$current_amount' },
            saved_this_month: {
              $sum: {
                $ifNull: [{ $arrayElemAt: ['$month_contributions.total', 0] }, 0],
              },
            },
          },
        },
      ])
      .exec();

    const target = row?.target_amount ?? 0;
    const current = row?.current_amount ?? 0;

    return {
      count: row?.count ?? 0,
      target_amount: target,
      current_amount: current,
      progress_percentage: percentage(current, target),
      saved_this_month: row?.saved_this_month ?? 0,
    };
  }

  // Los 5 gastos más altos del mes, con la categoría populada.
  private async topExpenses(
    user: Types.ObjectId,
    start: Date,
    end: Date,
  ): Promise<Expense[]> {
    return this.expenseModel
      .find({ user_id: user, date: { $gte: start, $lte: end } })
      .populate('category_id')
      .sort({ amount: -1, date: -1 })
      .limit(5)
      .exec();
  }
}
