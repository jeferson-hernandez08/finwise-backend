import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post()
  create(@Body() createDebtDto: CreateDebtDto) {
    return this.debtsService.create(createDebtDto);
  }

  @Get()
  findAll() {
    return this.debtsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.debtsService.findOne(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.debtsService.findByUser(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDebtDto: UpdateDebtDto) {
    return this.debtsService.update(id, updateDebtDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.debtsService.remove(id);
  }
}