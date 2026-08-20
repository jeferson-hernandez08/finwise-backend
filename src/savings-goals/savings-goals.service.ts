import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
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

  // ========== MÉTODOS CON FILTRO POR USUARIO ==========

  // 1. Crear objetivo (el DTO ya contiene user_id)
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

  // 2. Listar todos los objetivos de un usuario
  async findAllByUser(userId: string) {
    return this.savingsGoalModel.find({ user_id: userId }).exec();
  }

  // 3. Obtener un objetivo por ID verificando propiedad
  async findOneForUser(id: string, userId: string) {
    const goal = await this.savingsGoalModel.findOne({ _id: id, user_id: userId }).exec();
    if (!goal) {
      throw new NotFoundException('Objetivo de ahorro no encontrado o no pertenece al usuario');
    }
    return goal;
  }

  // 4. Actualizar objetivo verificando propiedad
  async updateForUser(id: string, updateDto: UpdateSavingsGoalDto, userId: string) {
    // Primero verificar que el objetivo exista y pertenezca al usuario
    await this.findOneForUser(id, userId);

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
      throw new NotFoundException('Objetivo de ahorro no encontrado');
    }
    return updated;
  }

  // 5. Eliminar objetivo verificando propiedad
  async removeForUser(id: string, userId: string) {
    // Verificar que el objetivo exista y pertenezca al usuario
    await this.findOneForUser(id, userId);
    const result = await this.savingsGoalModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Objetivo de ahorro no encontrado');
    }
    return result;
  }

  // ========== MÉTODO AUXILIAR (para usar en savings-contributions) ==========
  async findById(id: string) {
    return this.savingsGoalModel.findById(id).exec();
  }
}