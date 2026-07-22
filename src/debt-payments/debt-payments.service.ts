import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DebtPayment } from '../schemas/debt-payment.schema';
import { CreateDebtPaymentDto } from './dto/create-debt-payment.dto';
import { UpdateDebtPaymentDto } from './dto/update-debt-payment.dto';

@Injectable()
export class DebtPaymentsService {
  constructor(
    @InjectModel(DebtPayment.name) private debtPaymentModel: Model<DebtPayment>
  ) {}

  async create(createDto: CreateDebtPaymentDto) {
    const newPayment = new this.debtPaymentModel(createDto);
    return newPayment.save();
  }

  async findAll() {
    return this.debtPaymentModel.find().populate('debt_id').exec();
  }

  async findOne(id: string) {
    const payment = await this.debtPaymentModel.findById(id).populate('debt_id').exec();
    if (!payment) {
      throw new NotFoundException(`Pago de deuda con ID ${id} no encontrado`);
    }
    return payment;
  }

  // Obtener pagos por deuda
  async findByDebt(debtId: string) {
    return this.debtPaymentModel.find({ debt_id: debtId }).populate('debt_id').exec();
  }

  async update(id: string, updateDto: UpdateDebtPaymentDto) {
    const updated = await this.debtPaymentModel
      .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
      .populate('debt_id')
      .exec();
    if (!updated) {
      throw new NotFoundException(`Pago de deuda con ID ${id} no encontrado`);
    }
    return updated;
  }

  async remove(id: string) {
    const result = await this.debtPaymentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Pago de deuda con ID ${id} no encontrado`);
    }
    return result;
  }
}