import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Expense, ExpenseSchema } from '../schemas/expense.schema';
import {
  ExpenseCategory,
  ExpenseCategorySchema,
} from '../schemas/expense-category.schema';
import { MonthlyIncome, MonthlyIncomeSchema } from '../schemas/monthly-income.schema';
import { Debt, DebtSchema } from '../schemas/debt.schema';
import { DebtPayment, DebtPaymentSchema } from '../schemas/debt-payment.schema';
import { SavingsGoal, SavingsGoalSchema } from '../schemas/savings-goal.schema';
import {
  SavingsContribution,
  SavingsContributionSchema,
} from '../schemas/savings-contribution.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: ExpenseCategory.name, schema: ExpenseCategorySchema },
      { name: MonthlyIncome.name, schema: MonthlyIncomeSchema },
      { name: Debt.name, schema: DebtSchema },
      { name: DebtPayment.name, schema: DebtPaymentSchema },
      { name: SavingsGoal.name, schema: SavingsGoalSchema },
      { name: SavingsContribution.name, schema: SavingsContributionSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
