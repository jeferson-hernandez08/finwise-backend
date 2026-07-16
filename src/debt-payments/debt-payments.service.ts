import { Injectable } from '@nestjs/common';
import { CreateDebtPaymentDto } from './dto/create-debt-payment.dto';
import { UpdateDebtPaymentDto } from './dto/update-debt-payment.dto';

@Injectable()
export class DebtPaymentsService {
  create(createDebtPaymentDto: CreateDebtPaymentDto) {
    return 'This action adds a new debtPayment';
  }

  findAll() {
    return `This action returns all debtPayments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} debtPayment`;
  }

  update(id: number, updateDebtPaymentDto: UpdateDebtPaymentDto) {
    return `This action updates a #${id} debtPayment`;
  }

  remove(id: number) {
    return `This action removes a #${id} debtPayment`;
  }
}
