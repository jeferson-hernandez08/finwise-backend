import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
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
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({    // <-- Carga el archivo .env
      isGlobal: true,
    }),
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
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}