import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ // Carga el archivo .env
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          // Preferimos fallar al arrancar antes que dejar credenciales en el codigo.
          throw new Error(
            'Falta la variable de entorno MONGODB_URI. ' +
              'Copia .env.example a .env en la raiz de finwise-backend y ' +
              'escribe ahi la cadena de conexion de MongoDB antes de arrancar la API.',
          );
        }
        return { uri };
      },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    MonthlyIncomesModule,
    DebtsModule,
    ExpensesModule,
    ExpenseCategoriesModule,
    DebtPaymentsModule,
    SavingsGoalsModule,
    SavingsContributionsModule,
    DashboardModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Protegemos todas las rutas por defecto
    },
  ],
})
export class AppModule {}
