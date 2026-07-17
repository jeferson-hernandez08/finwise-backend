// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, UserSchema } from './schemas/user.schema';
import { UsersModule } from './users/users.module';
import { MonthlyIncomesModule } from './monthly-incomes/monthly-incomes.module';
import { ExpensesModule } from './expenses/expenses.module';
import { DebtsModule } from './debts/debts.module';
import { DebtPaymentsModule } from './debt-payments/debt-payments.module';
import { SavingsGoalsModule } from './savings-goals/savings-goals.module';
import { SavingsContributionsModule } from './savings-contributions/savings-contributions.module';
import { ExpenseCategoriesModule } from './expense-categories/expense-categories.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://jeferson_hernandez_finwiseapp:ASDasd.123@cluster0.ii0kln6.mongodb.net/finwise_db?retryWrites=true&w=majority'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    MonthlyIncomesModule,
    DebtsModule,
    ExpensesModule,
    ExpenseCategoriesModule,
    DebtPaymentsModule,
    SavingsGoalsModule,
    SavingsContributionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}