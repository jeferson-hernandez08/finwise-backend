import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Debt } from '../schemas/debt.schema';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

@Injectable()
export class DebtsService {
  constructor(@InjectModel(Debt.name) private debtModel: Model<Debt>) {}

  // ========== MÉTODOS CON FILTRO POR USUARIO ==========

  // 1. Crear deuda (el DTO ya contiene user_id)
  async create(createDto: CreateDebtDto) {
    // Validación de negocio
    if (createDto.remaining_amount > createDto.total_amount) {
      throw new BadRequestException('remaining_amount cannot exceed total_amount');
    }
    const newDebt = new this.debtModel(createDto);
    return newDebt.save();
  }

  // 2. Obtener todas las deudas de un usuario
  async findAllByUser(userId: string) {
    return this.debtModel.find({ user_id: userId }).exec();
  }

  // 3. Obtener una deuda por ID verificando propiedad
  async findOneForUser(id: string, userId: string) {
    const debt = await this.debtModel.findOne({ _id: id, user_id: userId }).exec();
    if (!debt) {
      throw new NotFoundException('Deuda no encontrada o no pertenece al usuario');
    }
    return debt;
  }

  // 4. Actualizar deuda verificando propiedad
  async updateForUser(id: string, updateDto: UpdateDebtDto, userId: string) {
    // Primero verificar que la deuda exista y pertenezca al usuario
    await this.findOneForUser(id, userId);

    // Validar remaining_amount vs total_amount si se actualizan
    const debt = await this.debtModel.findById(id).exec();
    const newTotal = updateDto.total_amount ?? debt.total_amount;
    const newRemaining = updateDto.remaining_amount ?? debt.remaining_amount;
    if (newRemaining > newTotal) {
      throw new BadRequestException('remaining_amount cannot exceed total_amount');
    }

    const updated = await this.debtModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true, runValidators: true }
    ).exec();
    if (!updated) {
      throw new NotFoundException('Deuda no encontrada');
    }
    return updated;
  }

  // 5. Eliminar deuda verificando propiedad
  async removeForUser(id: string, userId: string) {
    // Verificar que la deuda exista y pertenezca al usuario
    await this.findOneForUser(id, userId);
    const result = await this.debtModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Deuda no encontrada');
    }
    return result;
  }

  // ========== MÉTODOS AUXILIARES (para otros servicios) ==========

  // Útil para actualizar remaining_amount desde pagos (con verificación de propiedad)
  async updateRemainingAmount(debtId: string, newRemaining: number, userId: string) {
    const debt = await this.findOneForUser(debtId, userId);
    if (newRemaining > debt.total_amount) {
      throw new BadRequestException('remaining_amount cannot exceed total_amount');
    }
    if (newRemaining < 0) {
      throw new BadRequestException('remaining_amount cannot be negative');
    }
    debt.remaining_amount = newRemaining;
    return debt.save();
  }

  // Método para obtener una deuda sin verificar propiedad (para uso interno controlado)
  async findById(debtId: string) {
    return this.debtModel.findById(debtId).exec();
  }
}