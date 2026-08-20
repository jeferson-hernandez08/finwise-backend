import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DebtPayment } from '../schemas/debt-payment.schema';
import { Debt } from '../schemas/debt.schema';
import { CreateDebtPaymentDto } from './dto/create-debt-payment.dto';
import { UpdateDebtPaymentDto } from './dto/update-debt-payment.dto';

@Injectable()
export class DebtPaymentsService {
  constructor(
    @InjectModel(DebtPayment.name) private debtPaymentModel: Model<DebtPayment>,
    @InjectModel(Debt.name) private debtModel: Model<Debt>,
  ) {}

  // ========== MÉTODOS CON FILTRO POR USUARIO ==========

  // 1. Crear pago (verifica que la deuda pertenezca al usuario)
  async create(createDto: CreateDebtPaymentDto, userId: string) {
    // Verificar que la deuda existe y pertenece al usuario
    const debt = await this.debtModel.findOne({
      _id: createDto.debt_id,
      user_id: userId,
    }).exec();
    if (!debt) {
      throw new NotFoundException('Deuda no encontrada o no pertenece al usuario');
    }

    // Verificar que el pago no exceda el saldo restante
    if (createDto.amount > debt.remaining_amount) {
      throw new ConflictException(
        `El pago de ${createDto.amount} excede el saldo restante de ${debt.remaining_amount}`
      );
    }

    // Crear el pago
    const newPayment = new this.debtPaymentModel(createDto);
    const savedPayment = await newPayment.save();

    // Actualizar el saldo restante de la deuda
    const newRemaining = debt.remaining_amount - createDto.amount;
    await this.debtModel.findByIdAndUpdate(
      createDto.debt_id,
      { remaining_amount: newRemaining },
      { new: true }
    ).exec();

    return savedPayment;
  }

  // 2. Listar todos los pagos de las deudas del usuario
  async findAllByUser(userId: string) {
    // Obtener IDs de todas las deudas del usuario
    const debts = await this.debtModel.find({ user_id: userId }).select('_id').exec();
    const debtIds = debts.map(d => d._id);
    return this.debtPaymentModel
      .find({ debt_id: { $in: debtIds } })
      .populate('debt_id', 'name total_amount remaining_amount')
      .sort({ payment_date: -1 })
      .exec();
  }

  // 3. Obtener pagos de una deuda específica (verificando propiedad)
  async findByDebtForUser(debtId: string, userId: string) {
    // Verificar que la deuda pertenezca al usuario
    const debt = await this.debtModel.findOne({
      _id: debtId,
      user_id: userId,
    }).exec();
    if (!debt) {
      throw new NotFoundException('Deuda no encontrada o no pertenece al usuario');
    }
    return this.debtPaymentModel
      .find({ debt_id: debtId })
      .sort({ payment_date: -1 })
      .exec();
  }

  // 4. Obtener un pago por ID (verificando propiedad)
  async findOneForUser(id: string, userId: string) {
    const payment = await this.debtPaymentModel.findById(id)
      .populate('debt_id', 'name total_amount remaining_amount')
      .exec();
    if (!payment) {
      throw new NotFoundException('Pago de deuda no encontrado');
    }
    // Verificar que la deuda asociada pertenezca al usuario
    const debt = await this.debtModel.findOne({
      _id: payment.debt_id,
      user_id: userId,
    }).exec();
    if (!debt) {
      throw new ForbiddenException('No tienes permiso para acceder a este pago');
    }
    return payment;
  }

  // 5. Actualizar un pago (solo permite modificar la nota)
  async updateForUser(id: string, updateDto: UpdateDebtPaymentDto, userId: string) {
    // Primero verificar que el pago existe y la deuda es del usuario
    const payment = await this.debtPaymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException('Pago de deuda no encontrado');
    }
    const debt = await this.debtModel.findOne({
      _id: payment.debt_id,
      user_id: userId,
    }).exec();
    if (!debt) {
      throw new ForbiddenException('No tienes permiso para modificar este pago');
    }
    // Solo permitir actualizar la nota (por simplicidad)
    const updated = await this.debtPaymentModel
      .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Pago de deuda no encontrado');
    }
    return updated;
  }

  // 6. Eliminar un pago (restaura el saldo de la deuda)
  async removeForUser(id: string, userId: string) {
    // Obtener el pago y verificar propiedad
    const payment = await this.debtPaymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException('Pago de deuda no encontrado');
    }
    const debt = await this.debtModel.findOne({
      _id: payment.debt_id,
      user_id: userId,
    }).exec();
    if (!debt) {
      throw new ForbiddenException('No tienes permiso para eliminar este pago');
    }

    // Restaurar el saldo de la deuda
    const newRemaining = debt.remaining_amount + payment.amount;
    await this.debtModel.findByIdAndUpdate(
      payment.debt_id,
      { remaining_amount: newRemaining },
      { new: true }
    ).exec();

    // Eliminar el pago
    const result = await this.debtPaymentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Pago de deuda no encontrado');
    }
    return result;
  }
}