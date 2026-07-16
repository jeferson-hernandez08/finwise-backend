// src/monthly-incomes/monthly-incomes.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { MonthlyIncomesService } from './monthly-incomes.service';
import { CreateMonthlyIncomeDto } from './dto/create-monthly-income.dto';
import { UpdateMonthlyIncomeDto } from './dto/update-monthly-income.dto';

@Controller('monthly-incomes')
export class MonthlyIncomesController {
  constructor(private readonly monthlyIncomesService: MonthlyIncomesService) {}

  @Post()
  create(@Body() createMonthlyIncomeDto: CreateMonthlyIncomeDto) {
    return this.monthlyIncomesService.create(createMonthlyIncomeDto);
  }

  @Get()
  findAll() {
    return this.monthlyIncomesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.monthlyIncomesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMonthlyIncomeDto: UpdateMonthlyIncomeDto) {
    return this.monthlyIncomesService.update(id, updateMonthlyIncomeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.monthlyIncomesService.remove(id);
  }
}