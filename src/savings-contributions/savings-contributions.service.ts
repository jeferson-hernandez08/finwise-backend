import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  // ========== MÉTODOS CON FILTRO POR USUARIO ==========

  // 1. Crear contribución (verifica que el objetivo pertenezca al usuario)
  async create(createDto: CreateSavingsContributionDto, userId: string) {
    // 1. Verificar que el objetivo existe y pertenece al usuario
    const goal = await this.savingsGoalModel.findOne({
      _id: createDto.savings_goal_id,
      user_id: userId,
    }).exec();
    if (!goal) {
      throw new NotFoundException(
        'Objetivo de ahorro no encontrado o no pertenece al usuario'
      );
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

  // 2. Listar todas las contribuciones de todos los objetivos del usuario
  async findAllByUser(userId: string) {
    // Obtener todos los objetivos del usuario
    const goals = await this.savingsGoalModel.find({ user_id: userId }).select('_id').exec();
    const goalIds = goals.map(g => g._id);
    return this.contributionModel
      .find({ savings_goal_id: { $in: goalIds } })
      .populate('savings_goal_id', 'name target_amount current_amount')
      .sort({ date: -1 })
      .exec();
  }

  // 3. Listar contribuciones de un objetivo específico (verificando propiedad)
  async findByGoalForUser(goalId: string, userId: string) {
    // Verificar que el objetivo pertenezca al usuario
    const goal = await this.savingsGoalModel.findOne({
      _id: goalId,
      user_id: userId,
    }).exec();
    if (!goal) {
      throw new NotFoundException(
        'Objetivo de ahorro no encontrado o no pertenece al usuario'
      );
    }
    return this.contributionModel
      .find({ savings_goal_id: goalId })
      .sort({ date: -1 })
      .exec();
  }

  // 4. Obtener una contribución por ID (verificando propiedad)
  async findOneForUser(id: string, userId: string) {
    const contribution = await this.contributionModel
      .findById(id)
      .populate('savings_goal_id', 'name target_amount current_amount')
      .exec();
    if (!contribution) {
      throw new NotFoundException('Contribución no encontrada');
    }
    // Verificar que el objetivo asociado pertenezca al usuario
    const goal = await this.savingsGoalModel.findOne({
      _id: contribution.savings_goal_id,
      user_id: userId,
    }).exec();
    if (!goal) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a esta contribución'
      );
    }
    return contribution;
  }

  // 5. Actualizar contribución (solo permite modificar la nota)
  async updateForUser(
    id: string,
    updateDto: UpdateSavingsContributionDto,
    userId: string,
  ) {
    // Verificar que la contribución existe y el objetivo pertenece al usuario
    const contribution = await this.contributionModel.findById(id).exec();
    if (!contribution) {
      throw new NotFoundException('Contribución no encontrada');
    }
    const goal = await this.savingsGoalModel.findOne({
      _id: contribution.savings_goal_id,
      user_id: userId,
    }).exec();
    if (!goal) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta contribución'
      );
    }
    // Solo actualizar la nota (por simplicidad)
    const updated = await this.contributionModel
      .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Contribución no encontrada');
    }
    return updated;
  }

  // 6. Eliminar contribución (restaura el current_amount del objetivo)
  async removeForUser(id: string, userId: string) {
    // 1. Obtener la contribución y verificar propiedad
    const contribution = await this.contributionModel.findById(id).exec();
    if (!contribution) {
      throw new NotFoundException('Contribución no encontrada');
    }
    const goal = await this.savingsGoalModel.findOne({
      _id: contribution.savings_goal_id,
      user_id: userId,
    }).exec();
    if (!goal) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta contribución'
      );
    }

    // 2. Restaurar el current_amount del objetivo
    const newCurrent = goal.current_amount - contribution.amount;
    if (newCurrent < 0) {
      throw new ConflictException(
        `El current_amount del objetivo quedaría negativo (${newCurrent})`
      );
    }
    await this.savingsGoalModel.findByIdAndUpdate(
      contribution.savings_goal_id,
      { current_amount: newCurrent },
      { new: true }
    ).exec();

    // 3. Eliminar la contribución
    const result = await this.contributionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Contribución no encontrada');
    }
    return result;
  }
}