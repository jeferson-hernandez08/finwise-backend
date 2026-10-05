// src/expenses/expenses.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense } from '../schemas/expense.schema';
import { Debt } from '../schemas/debt.schema';
import { ExpenseCategory } from '../schemas/expense-category.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

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
        { new: true },
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
    const filter: any = { user_id: userId };

    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
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

  // 5. Actualizar (verifica propiedad)
  async updateForUser(id: string, updateDto: UpdateExpenseDto, userId: string) {
    // No permitir cambiar user_id o debt_id por simplicidad (o gestionar actualización de deuda)
    // Puedes permitir cambiar campos básicos (description, amount, date, category_id)
    const expense = await this.expenseModel
      .findOneAndUpdate(
        { _id: id, user_id: userId },
        updateDto,
        { new: true, runValidators: true },
      )
      .exec();
    if (!expense) {
      throw new NotFoundException('Gasto no encontrado o no pertenece al usuario');
    }
    return expense;
  }

  // 6. Eliminar (verifica propiedad)
  async removeForUser(id: string, userId: string) {
    const expense = await this.expenseModel
      .findOneAndDelete({ _id: id, user_id: userId })
      .exec();
    if (!expense) {
      throw new NotFoundException('Gasto no encontrado o no pertenece al usuario');
    }
    // Si el gasto tenía deuda, podríamos revertir el remaining_amount?
    // Depende de la lógica de negocio. Por ahora no lo revertimos.
    // Si quieres revertir, descomenta:
    // if (expense.debt_id) {
    //   await this.debtModel.findByIdAndUpdate(expense.debt_id, {
    //     $inc: { remaining_amount: expense.amount }
    //   }).exec();
    // }
    return expense;
  }
}