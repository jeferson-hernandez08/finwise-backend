import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Expense, ExpenseSchema } from '../schemas/expense.schema';
import { Debt, DebtSchema } from '../schemas/debt.schema'; // Para actualizar deuda
import { ExpenseCategory, ExpenseCategorySchema } from '../schemas/expense-category.schema'; // para validar categoría

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: Debt.name, schema: DebtSchema },
      { name: ExpenseCategory.name, schema: ExpenseCategorySchema }
    ])
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}