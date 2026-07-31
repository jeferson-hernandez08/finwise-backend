import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SavingsContribution } from '../schemas/savings-contribution.schema';
import { SavingsGoal } from '../schemas/savings-goal.schema';
import { CreateSavingsContributionDto } from './dto/create-savings-contribution.dto';
import { UpdateSavingsContributionDto } from './dto/update-savings-contribution.dto';

@Injectable()
export class SavingsContributionsService {
  constructor(
    @InjectModel(SavingsContribution.name) private contributionModel: Model<SavingsContribution>,
    @InjectModel(SavingsGoal.name) private savingsGoalModel: Model<SavingsGoal>,
  ) {}

  async create(createDto: CreateSavingsContributionDto) {
    // 1. Verificar que el objetivo de ahorro existe
    const goal = await this.savingsGoalModel.findById(createDto.savings_goal_id).exec();
    if (!goal) {
      throw new NotFoundException(`Objetivo de ahorro con ID ${createDto.savings_goal_id} no encontrado`);
    }

    // 2. Verificar que la contribución no exceda el monto restante para alcanzar la meta
    const remaining = goal.target_amount - goal.current_amount;
    if (createDto.amount > remaining) {
      throw new ConflictException(
        `La contribución de ${createDto.amount} excede el monto restante para alcanzar la meta (${remaining})`
      );
    }

    // 3. Crear la contribución
    const newContribution = new this.contributionModel(createDto);
    const savedContribution = await newContribution.save();

    // 4. Actualizar el current_amount del objetivo
    const newCurrent = goal.current_amount + createDto.amount;
    await this.savingsGoalModel.findByIdAndUpdate(
      createDto.savings_goal_id,
      { current_amount: newCurrent },
      { new: true }
    ).exec();

    return savedContribution;
  }

  async findAll() {
    return this.contributionModel.find()
      .populate('savings_goal_id', 'name target_amount current_amount')
      .exec();
  }

  async findOne(id: string) {
    const contribution = await this.contributionModel.findById(id)
      .populate('savings_goal_id', 'name target_amount current_amount')
      .exec();
    if (!contribution) {
      throw new NotFoundException(`Contribución con ID ${id} no encontrada`);
    }
    return contribution;
  }

  async findByGoal(savings_goal_id: string) {
    return this.contributionModel.find({ savings_goal_id })
      .sort({ date: -1 })
      .exec();
  }

  async update(id: string, updateDto: UpdateSavingsContributionDto) {
    // Actualizar una contribución implica recalcular el current_amount del objetivo
    // Por simplicidad, solo permitimos actualizar la nota.
    // Si se actualiza monto o fecha, se necesita lógica más compleja.
    const updated = await this.contributionModel
      .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Contribución con ID ${id} no encontrada`);
    }
    return updated;
  }

  async remove(id: string) {
    // 1. Obtener la contribución antes de eliminar
    const contribution = await this.contributionModel.findById(id).exec();
    if (!contribution) {
      throw new NotFoundException(`Contribución con ID ${id} no encontrada`);
    }

    // 2. Obtener el objetivo para actualizar su current_amount
    const goal = await this.savingsGoalModel.findById(contribution.savings_goal_id).exec();
    if (goal) {
      const newCurrent = goal.current_amount - contribution.amount;
      if (newCurrent < 0) {
        // Esto no debería pasar si los datos son consistentes, pero prevenimos
        throw new ConflictException(
          `El current_amount del objetivo quedaría negativo (${newCurrent})`
        );
      }
      await this.savingsGoalModel.findByIdAndUpdate(
        contribution.savings_goal_id,
        { current_amount: newCurrent },
        { new: true }
      ).exec();
    }

    // 3. Eliminar la contribución
    const result = await this.contributionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Contribución con ID ${id} no encontrada`);
    }
    return result;
  }
}