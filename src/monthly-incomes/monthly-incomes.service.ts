import { Injectable } from '@nestjs/common';
import { CreateMonthlyIncomeDto } from './dto/create-monthly-income.dto';
import { UpdateMonthlyIncomeDto } from './dto/update-monthly-income.dto';

@Injectable()
export class MonthlyIncomesService {
  create(createMonthlyIncomeDto: CreateMonthlyIncomeDto) {
    return 'This action adds a new monthlyIncome';
  }

  findAll() {
    return `This action returns all monthlyIncomes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} monthlyIncome`;
  }

  update(id: number, updateMonthlyIncomeDto: UpdateMonthlyIncomeDto) {
    return `This action updates a #${id} monthlyIncome`;
  }

  remove(id: number) {
    return `This action removes a #${id} monthlyIncome`;
  }
}
