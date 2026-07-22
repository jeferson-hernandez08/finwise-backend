import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { DebtPaymentsService } from './debt-payments.service';
import { CreateDebtPaymentDto } from './dto/create-debt-payment.dto';
import { UpdateDebtPaymentDto } from './dto/update-debt-payment.dto';

@Controller('debt-payments')
export class DebtPaymentsController {
  constructor(private readonly debtPaymentsService: DebtPaymentsService) {}

  @Post()
  create(@Body() createDebtPaymentDto: CreateDebtPaymentDto) {
    return this.debtPaymentsService.create(createDebtPaymentDto);
  }

  @Get()
  findAll() {
    return this.debtPaymentsService.findAll();
  }

  @Get('debt/:debtId')
  findByDebt(@Param('debtId') debtId: string) {
    return this.debtPaymentsService.findByDebt(debtId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.debtPaymentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDebtPaymentDto: UpdateDebtPaymentDto) {
    return this.debtPaymentsService.update(id, updateDebtPaymentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.debtPaymentsService.remove(id);
  }
}