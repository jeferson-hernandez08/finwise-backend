import { Module } from '@nestjs/common';
import { MonthlyIncomesService } from './monthly-incomes.service';
import { MonthlyIncomesController } from './monthly-incomes.controller';

@Module({
  controllers: [MonthlyIncomesController],
  providers: [MonthlyIncomesService],
})
export class MonthlyIncomesModule {}
