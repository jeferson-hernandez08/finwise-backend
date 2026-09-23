// src/expenses/expenses.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense } from '../schemas/expense.schema';
import { Debt } from '../schemas/debt.schema';
import { ExpenseCategory } from '../schemas/expense-category.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { monthRange, yearRange } from '../common/date-range.util';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    @InjectModel(Debt.name) private debtModel: Model<Debt>,
    @InjectModel(ExpenseCategory.name) private categoryModel: Model<ExpenseCategory>,
  ) {}

  // ========== MÉTODOS CON FILTRO POR USUARIO ==========

  // 1. Crear gasto (ya recibe user_id en el DTO)
  async create(createExpenseDto: CreateExpenseDto) {
    // Validar que la categoría exista
    const category = await this.categoryModel.findById(createExpenseDto.category_id).exec();
    if (!category) {
      throw new BadRequestException('Categoría no encontrada');
    }

    // Si se proporciona debt_id, validar que la deuda exista y pertenezca al usuario
    if (createExpenseDto.debt_id) {
      const debt = await this.debtModel.findOne({
        _id: createExpenseDto.debt_id,
        user_id: createExpenseDto.user_id,
      }).exec();
      if (!debt) {
        throw new BadRequestException('Deuda no encontrada o no pertenece al usuario');
      }
      if (debt.remaining_amount < createExpenseDto.amount) {
        throw new BadRequestException(
          `El monto del pago (${createExpenseDto.amount}) excede el saldo restante (${debt.remaining_amount})`
        );
      }
    }

    // Crear el gasto
    const newExpense = new this.expenseModel({
      ...createExpenseDto,
      debt_id: createExpenseDto.debt_id || null,
    });
    const savedExpense = await newExpense.save();

    // Si tiene deuda, actualizar remaining_amount
    if (createExpenseDto.debt_id) {
      await this.debtModel.findByIdAndUpdate(
        createExpenseDto.debt_id,
        { $inc: { remaining_amount: -createExpenseDto.amount } },
      ).exec();
    }

    return savedExpense;
  }

  // 2. Listar todos los gastos de un usuario
  async findAllByUser(userId: string) {
    return this.expenseModel
      .find({ user_id: userId })
      .populate('category_id')
      .populate('debt_id')
      .sort({ date: -1 })
      .exec();
  }

  // 3. Listar con filtro de año/mes
  async findByUserAndDate(userId: string, year?: number, month?: number) {
    const filter: Record<string, unknown> = { user_id: userId };

    if (year && month) {
      const { start, end } = monthRange(year, month);
      filter.date = { $gte: start, $lte: end };
    } else if (year) {
      const { start, end } = yearRange(year);
      filter.date = { $gte: start, $lte: end };
    }

    return this.expenseModel
      .find(filter)
      .populate('category_id')
      .populate('debt_id')
      .sort({ date: -1 })
      .exec();
  }

  // 4. Obtener un gasto (verifica propiedad)
  async findOneForUser(id: string, userId: string) {
    const expense = await this.expenseModel
      .findOne({ _id: id, user_id: userId })
      .populate('category_id')
      .populate('debt_id')
      .exec();
    if (!expense) {
      throw new NotFoundException('Gasto no encontrado o no pertenece al usuario');
    }
    return expense;
  }

  // 5. Actualizar (verifica propiedad y reajusta el saldo de la deuda)
  async updateForUser(id: string, updateDto: UpdateExpenseDto, userId: string) {
    const expense = await this.expenseModel.findOne({ _id: id, user_id: userId }).exec();
    if (!expense) {
      throw new NotFoundException('Gasto no encontrado o no pertenece al usuario');
    }

    if (updateDto.category_id) {
      const category = await this.categoryModel.findById(updateDto.category_id).exec();
      if (!category) {
        throw new BadRequestException('Categoría no encontrada');
      }
    }

    const previousDebtId = expense.debt_id ? String(expense.debt_id) : null;
    const previousAmount = expense.amount;
    // debt_id solo cambia si viene en el cuerpo; null significa "desligar".
    const nextDebtId =
      updateDto.debt_id !== undefined ? updateDto.debt_id || null : previousDebtId;
    const nextAmount = updateDto.amount !== undefined ? updateDto.amount : previousAmount;

    if (nextDebtId) {
      const debt = await this.debtModel
        .findOne({ _id: nextDebtId, user_id: userId })
        .exec();
      if (!debt) {
        throw new BadRequestException('Deuda no encontrada o no pertenece al usuario');
      }
      // Lo que este gasto ya descontó a esa misma deuda vuelve a estar disponible.
      const refund = previousDebtId === nextDebtId ? previousAmount : 0;
      const available = debt.remaining_amount + refund;
      if (available < nextAmount) {
        throw new BadRequestException(
          `El monto del pago (${nextAmount}) excede el saldo restante (${available})`
        );
      }
    }

    // user_id nunca se cambia desde el cuerpo de la petición.
    const { user_id: _ignored, ...fields } = updateDto;
    const updated = await this.expenseModel
      .findOneAndUpdate(
        { _id: id, user_id: userId },
        { ...fields, debt_id: nextDebtId },
        { new: true, runValidators: true },
      )
      .populate('category_id')
      .populate('debt_id')
      .exec();

    // Devolver el importe anterior y descontar el nuevo mantiene el saldo coherente.
    if (previousDebtId && previousDebtId === nextDebtId) {
      const difference = nextAmount - previousAmount;
      if (difference !== 0) {
        await this.debtModel
          .findByIdAndUpdate(previousDebtId, { $inc: { remaining_amount: -difference } })
          .exec();
      }
    } else {
      if (previousDebtId) {
        await this.debtModel
          .findByIdAndUpdate(previousDebtId, { $inc: { remaining_amount: previousAmount } })
          .exec();
      }
      if (nextDebtId) {
        await this.debtModel
          .findByIdAndUpdate(nextDebtId, { $inc: { remaining_amount: -nextAmount } })
          .exec();
      }
    }

    return updated;
  }

  // 6. Eliminar (verifica propiedad)
  async removeForUser(id: string, userId: string) {
    const expense = await this.expenseModel
      .findOneAndDelete({ _id: id, user_id: userId })
      .exec();
    if (!expense) {
      throw new NotFoundException('Gasto no encontrado o no pertenece al usuario');
    }

    // El gasto había descontado saldo a la deuda: al borrarlo hay que devolverlo,
    // o la deuda queda marcada como pagada sin que exista el pago.
    if (expense.debt_id) {
      await this.debtModel
        .findByIdAndUpdate(expense.debt_id, { $inc: { remaining_amount: expense.amount } })
        .exec();
    }

    return expense;
  }
}
