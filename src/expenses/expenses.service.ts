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
    @InjectModel(ExpenseCategory.name) private categoryModel: Model<ExpenseCategory>
  ) {}

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
        user_id: createExpenseDto.user_id
      }).exec();
      if (!debt) {
        throw new BadRequestException('Deuda no encontrada o no pertenece al usuario');
      }
      if (debt.remaining_amount < createExpenseDto.amount) {
        throw new BadRequestException('El monto del pago excede el saldo restante de la deuda');
      }
    }

    // Crear el gasto
    const newExpense = new this.expenseModel({
      ...createExpenseDto,
      debt_id: createExpenseDto.debt_id || null
    });
    const savedExpense = await newExpense.save();

    // Si tiene deuda, actualizar remaining_amount
    if (createExpenseDto.debt_id) {
      await this.debtModel.findByIdAndUpdate(
        createExpenseDto.debt_id,
        { $inc: { remaining_amount: -createExpenseDto.amount } },
        { new: true }
      ).exec();
    }

    return savedExpense;
  }

  async findAll() {
    return this.expenseModel.find()
      .populate('category_id')
      .populate('debt_id')
      .exec();
  }

  async findOne(id: string) {
    const expense = await this.expenseModel.findById(id)
      .populate('category_id')
      .populate('debt_id')
      .exec();
    if (!expense) {
      throw new NotFoundException(`Gasto con ID ${id} no encontrado`);
    }
    return expense;
  }

  // Filtrar por usuario y opcionalmente por mes/año
  async findByUserAndDate(user_id: string, year?: number, month?: number) {
    const filter: any = { user_id };
    if (year && month) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      filter.date = { $gte: start, $lte: end };
    }
    return this.expenseModel.find(filter)
      .populate('category_id')
      .populate('debt_id')
      .exec();
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    // No permitir cambiar debt_id o user_id por simplicidad (o gestionar actualización de deuda)
    // Podrías implementar lógica más compleja, pero por ahora solo actualizamos campos básicos
    const updated = await this.expenseModel.findByIdAndUpdate(
      id,
      updateExpenseDto,
      { new: true, runValidators: true }
    ).exec();
    if (!updated) {
      throw new NotFoundException(`Gasto con ID ${id} no encontrado`);
    }
    return updated;
  }

  async remove(id: string) {
    const expense = await this.expenseModel.findByIdAndDelete(id).exec();
    if (!expense) {
      throw new NotFoundException(`Gasto con ID ${id} no encontrado`);
    }
    // Si el gasto tenía deuda, podríamos revertir el remaining_amount? 
    // Depende de la lógica de negocio. Por ahora no lo revertimos.
    return expense;
  }
}