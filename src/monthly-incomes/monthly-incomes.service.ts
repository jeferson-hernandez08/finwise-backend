import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MonthlyIncome } from '../schemas/monthly-income.schema';
import { CreateMonthlyIncomeDto } from './dto/create-monthly-income.dto';
import { UpdateMonthlyIncomeDto } from './dto/update-monthly-income.dto';

@Injectable()
export class MonthlyIncomesService {
  constructor(
    @InjectModel(MonthlyIncome.name) private monthlyIncomeModel: Model<MonthlyIncome>
  ) {}

  async create(createDto: CreateMonthlyIncomeDto) {
    try {
      const newIncome = new this.monthlyIncomeModel(createDto);
      return await newIncome.save();
    } catch (error) {
      // Error 11000 es duplicate key (unique index de user_id+year+month)
      if (error.code === 11000) {
        throw new ConflictException(
          `Ya existe un ingreso para el mes ${createDto.month} del año ${createDto.year}`
        );
      }
      throw error;
    }
  }

  async findAll() {
    return this.monthlyIncomeModel.find().exec();
  }

  async findOne(id: string) {
    const income = await this.monthlyIncomeModel.findById(id).exec();
    if (!income) {
      throw new NotFoundException(`Ingreso mensual con ID ${id} no encontrado`);
    }
    return income;
  }

  async findByUserAndMonth(user_id: string, year: number, month: number) {
    return this.monthlyIncomeModel.findOne({ user_id, year, month }).exec();
  }

  async update(id: string, updateDto: UpdateMonthlyIncomeDto) {
    const updated = await this.monthlyIncomeModel
      .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Ingreso mensual con ID ${id} no encontrado`);
    }
    return updated;
  }

  async remove(id: string) {
    const result = await this.monthlyIncomeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Ingreso mensual con ID ${id} no encontrado`);
    }
    return result;
  }
}