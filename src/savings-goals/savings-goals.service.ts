import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SavingsGoal } from '../schemas/savings-goal.schema';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';

@Injectable()
export class SavingsGoalsService {
  constructor(
    @InjectModel(SavingsGoal.name) private savingsGoalModel: Model<SavingsGoal>,
  ) {}

  async create(createDto: CreateSavingsGoalDto) {
    // Si no se envía current_amount, se pone 0 por defecto
    if (createDto.current_amount === undefined) {
      createDto.current_amount = 0;
    }
    // Validar que current_amount no supere target_amount
    if (createDto.current_amount > createDto.target_amount) {
      throw new ConflictException(
        `El monto actual (${createDto.current_amount}) no puede superar al monto objetivo (${createDto.target_amount})`
      );
    }
    const newGoal = new this.savingsGoalModel(createDto);
    return newGoal.save();
  }

  async findAll() {
    return this.savingsGoalModel.find().exec();
  }

  async findOne(id: string) {
    const goal = await this.savingsGoalModel.findById(id).exec();
    if (!goal) {
      throw new NotFoundException(`Objetivo de ahorro con ID ${id} no encontrado`);
    }
    return goal;
  }

  async findByUser(user_id: string) {
    return this.savingsGoalModel.find({ user_id }).exec();
  }

  async update(id: string, updateDto: UpdateSavingsGoalDto) {
    // Si se actualiza target_amount, verificar que current_amount no lo supere
    if (updateDto.target_amount !== undefined) {
      const goal = await this.savingsGoalModel.findById(id).exec();
      if (goal) {
        const newTarget = updateDto.target_amount;
        const current = updateDto.current_amount ?? goal.current_amount;
        if (current > newTarget) {
          throw new ConflictException(
            `El monto actual (${current}) no puede superar al nuevo monto objetivo (${newTarget})`
          );
        }
      }
    }
    const updated = await this.savingsGoalModel
      .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Objetivo de ahorro con ID ${id} no encontrado`);
    }
    return updated;
  }

  async remove(id: string) {
    const result = await this.savingsGoalModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Objetivo de ahorro con ID ${id} no encontrado`);
    }
    return result;
  }
}