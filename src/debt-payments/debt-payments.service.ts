import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DebtPayment } from '../schemas/debt-payment.schema';
import { Debt } from '../schemas/debt.schema';
import { CreateDebtPaymentDto } from './dto/create-debt-payment.dto';
import { UpdateDebtPaymentDto } from './dto/update-debt-payment.dto';

@Injectable()
export class DebtPaymentsService {
  constructor(
    @InjectModel(DebtPayment.name) private debtPaymentModel: Model<DebtPayment>,
    @InjectModel(Debt.name) private debtModel: Model<Debt>, // Necesario para actualizar saldo
  ) {}

  async create(createDto: CreateDebtPaymentDto) {
    // 1. Verificar que la deuda existe
    const debt = await this.debtModel.findById(createDto.debt_id).exec();
    if (!debt) {
      throw new NotFoundException(`Deuda con ID ${createDto.debt_id} no encontrada`);
    }

    // 2. Verificar que el pago no exceda el saldo restante
    if (createDto.amount > debt.remaining_amount) {
      throw new ConflictException(
        `El pago de ${createDto.amount} excede el saldo restante de ${debt.remaining_amount}`
      );
    }

    // 3. Crear el pago
    const newPayment = new this.debtPaymentModel(createDto);
    const savedPayment = await newPayment.save();

    // 4. Actualizar el saldo restante de la deuda
    const newRemaining = debt.remaining_amount - createDto.amount;
    await this.debtModel.findByIdAndUpdate(
      createDto.debt_id,
      { remaining_amount: newRemaining },
      { new: true }
    ).exec();

    return savedPayment;
  }

  async findAll() {
    return this.debtPaymentModel.find()
      .populate('debt_id', 'name total_amount remaining_amount')
      .exec();
  }

  async findOne(id: string) {
    const payment = await this.debtPaymentModel.findById(id)
      .populate('debt_id', 'name total_amount remaining_amount')
      .exec();
    if (!payment) {
      throw new NotFoundException(`Pago de deuda con ID ${id} no encontrado`);
    }
    return payment;
  }

  async findByDebt(debt_id: string) {
    return this.debtPaymentModel.find({ debt_id })
      .sort({ payment_date: -1 })
      .exec();
  }

  async update(id: string, updateDto: UpdateDebtPaymentDto) {
    // Nota: Actualizar un pago requiere recalcular el saldo de la deuda.
    // Es complejo, por simplicidad, solo permitimos actualizar la nota.
    // Si necesitas actualizar monto/fecha, deberías hacer una lógica más compleja.
    const updated = await this.debtPaymentModel
      .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Pago de deuda con ID ${id} no encontrado`);
    }
    return updated;
  }

  async remove(id: string) {
    // Obtener el pago antes de eliminar
    const payment = await this.debtPaymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException(`Pago de deuda con ID ${id} no encontrado`);
    }

    // Restaurar el saldo de la deuda
    const debt = await this.debtModel.findById(payment.debt_id).exec();
    if (debt) {
      const newRemaining = debt.remaining_amount + payment.amount;
      await this.debtModel.findByIdAndUpdate(
        payment.debt_id,
        { remaining_amount: newRemaining },
        { new: true }
      ).exec();
    }

    // Eliminar el pago
    const result = await this.debtPaymentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Pago de deuda con ID ${id} no encontrado`);
    }
    return result;
  }
}