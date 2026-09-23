import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Query, BadRequestException } from '@nestjs/common';
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

  // Devuelve null (200) cuando ese mes no tiene ingreso: es un estado normal.
  @Get('filter')
  findByMonthYear(
    @UserId() userId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = Number.parseInt(year, 10);
    const m = Number.parseInt(month, 10);
    if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
      throw new BadRequestException(
        'Los parámetros year y month son obligatorios (month entre 1 y 12)',
      );
    }
    return this.monthlyIncomesService.findByUserAndMonthOrNull(userId, y, m);
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