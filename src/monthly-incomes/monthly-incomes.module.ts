import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MonthlyIncomesService } from './monthly-incomes.service';
import { MonthlyIncomesController } from './monthly-incomes.controller';
import { MonthlyIncome, MonthlyIncomeSchema } from '../schemas/monthly-income.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MonthlyIncome.name, schema: MonthlyIncomeSchema }])
  ],
  controllers: [MonthlyIncomesController],
  providers: [MonthlyIncomesService],
})
export class MonthlyIncomesModule {}