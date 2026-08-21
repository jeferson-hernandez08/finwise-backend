import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { DebtPaymentsService } from './debt-payments.service';
import { CreateDebtPaymentDto } from './dto/create-debt-payment.dto';
import { UpdateDebtPaymentDto } from './dto/update-debt-payment.dto';
import { UserId } from '../decorators/user-id.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('debt-payments')
@UseGuards(JwtAuthGuard) // Protege todas las rutas
export class DebtPaymentsController {
  constructor(private readonly debtPaymentsService: DebtPaymentsService) {}

  @Post()
  create(@Body() createDebtPaymentDto: CreateDebtPaymentDto, @UserId() userId: string) {
    return this.debtPaymentsService.create(createDebtPaymentDto, userId);
  }

  @Get()
  findAll(@UserId() userId: string) {
    return this.debtPaymentsService.findAllByUser(userId);
  }

  @Get('debt/:debtId')
  findByDebt(@Param('debtId') debtId: string, @UserId() userId: string) {
    return this.debtPaymentsService.findByDebtForUser(debtId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UserId() userId: string) {
    return this.debtPaymentsService.findOneForUser(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDebtPaymentDto: UpdateDebtPaymentDto,
    @UserId() userId: string,
  ) {
    return this.debtPaymentsService.updateForUser(id, updateDebtPaymentDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @UserId() userId: string) {
    return this.debtPaymentsService.removeForUser(id, userId);
  }
}