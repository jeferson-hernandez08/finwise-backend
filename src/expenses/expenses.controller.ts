import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { UserId } from '../decorators/user-id.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard) // Protege todas las rutas
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  // 1. Crear gasto: asignar user_id automáticamente
  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto, @UserId() userId: string) {
    createExpenseDto.user_id = userId; // Asigna el ID del token
    return this.expensesService.create(createExpenseDto);
  }

  // 2. Listar todos los gastos del usuario autenticado
  @Get()
  findAll(@UserId() userId: string) {
    return this.expensesService.findAllByUser(userId);
  }

  // 3. Listar gastos del usuario autenticado con filtro de año/mes
  @Get('filter')
  findByDate(
    @UserId() userId: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const y = year ? parseInt(year, 10) : undefined;
    const m = month ? parseInt(month, 10) : undefined;
    return this.expensesService.findByUserAndDate(userId, y, m);
  }

  // 4. Obtener un gasto específico (verifica que sea del usuario)
  @Get(':id')
  findOne(@Param('id') id: string, @UserId() userId: string) {
    return this.expensesService.findOneForUser(id, userId);
  }

  // 5. Actualizar gasto (verifica que sea del usuario)
  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateExpenseDto: UpdateExpenseDto,
    @UserId() userId: string,
  ) {
    return this.expensesService.updateForUser(id, updateExpenseDto, userId);
  }

  // 6. Eliminar gasto (verifica que sea del usuario)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @UserId() userId: string) {
    return this.expensesService.removeForUser(id, userId);
  }
}