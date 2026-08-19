import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { UserId } from '../decorators/user-id.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('debts')
@UseGuards(JwtAuthGuard) // Protege todas las rutas
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post()
  create(@Body() createDebtDto: CreateDebtDto, @UserId() userId: string) {
    createDebtDto.user_id = userId; // Asignar user_id desde el token
    return this.debtsService.create(createDebtDto);
  }

  @Get()
  findAll(@UserId() userId: string) {
    return this.debtsService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UserId() userId: string) {
    return this.debtsService.findOneForUser(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDebtDto: UpdateDebtDto,
    @UserId() userId: string,
  ) {
    return this.debtsService.updateForUser(id, updateDebtDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @UserId() userId: string) {
    return this.debtsService.removeForUser(id, userId);
  }
}