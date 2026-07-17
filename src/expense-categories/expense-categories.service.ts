import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExpenseCategory } from '../schemas/expense-category.schema';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';

@Injectable()
export class ExpenseCategoriesService {
  constructor(
    @InjectModel(ExpenseCategory.name) private expenseCategoryModel: Model<ExpenseCategory>
  ) {}

  /**
   * Siembra las categorías por defecto al iniciar la aplicación.
   * Solo inserta las que no existan.
   */
  async seedDefaultCategories() {
    const defaultCategories = [
      'Food', 'Housing', 'Transportation', 'Health',
      'Education', 'Entertainment', 'Debts', 'Savings', 'Others'
    ];

    let createdCount = 0;
    for (const name of defaultCategories) {
      const existing = await this.expenseCategoryModel.findOne({ name }).exec();
      if (!existing) {
        await this.expenseCategoryModel.create({ name });
        createdCount++;
      }
    }
    if (createdCount > 0) {
      console.log(`✅ ${createdCount} categorías por defecto creadas.`);
    } else {
      console.log('ℹ️ Las categorías por defecto ya existen.');
    }
  }

  async create(createDto: CreateExpenseCategoryDto) {
    try {
      const newCategory = new this.expenseCategoryModel(createDto);
      return await newCategory.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(`La categoría "${createDto.name}" ya existe`);
      }
      throw error;
    }
  }

  async findAll() {
    return this.expenseCategoryModel.find().exec();
  }

  async findOne(id: string) {
    const category = await this.expenseCategoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return category;
  }

  async findByName(name: string) {
    return this.expenseCategoryModel.findOne({ name }).exec();
  }

  async update(id: string, updateDto: UpdateExpenseCategoryDto) {
    const updated = await this.expenseCategoryModel
      .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return updated;
  }

  async remove(id: string) {
    const result = await this.expenseCategoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return result;
  }
}