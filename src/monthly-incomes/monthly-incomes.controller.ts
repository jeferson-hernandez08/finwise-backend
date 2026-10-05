import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { MonthlyIncomesService } from './monthly-incomes.service';
import { CreateMonthlyIncomeDto } from './dto/create-monthly-income.dto';
import { UpdateMonthlyIncomeDto } from './dto/update-monthly-income.dto';
import { UserId } from '../decorators/user-id.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('monthly-incomes')
@UseGuards(JwtAuthGuard) // Protege todas las rutas
export class MonthlyIncomesController {
  constructor(private readonly monthlyIncomesService: MonthlyIncomesService) {}

  @Post()
  create(@Body() createMonthlyIncomeDto: CreateMonthlyIncomeDto, @UserId() userId: string) {
    createMonthlyIncomeDto.user_id = userId; // Asignar user_id desde el token
    return this.monthlyIncomesService.create(createMonthlyIncomeDto);
  }

  @Get()
  findAll(@UserId() userId: string) {
    return this.monthlyIncomesService.findAllByUser(userId);
  }

  @Get('filter')
  findByMonthYear(
    @UserId() userId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    return this.monthlyIncomesService.findByUserAndMonth(userId, y, m);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UserId() userId: string) {
    return this.monthlyIncomesService.findOneForUser(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMonthlyIncomeDto: UpdateMonthlyIncomeDto,
    @UserId() userId: string,
  ) {
    return this.monthlyIncomesService.updateForUser(id, updateMonthlyIncomeDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @UserId() userId: string) {
    return this.monthlyIncomesService.removeForUser(id, userId);
  }
}