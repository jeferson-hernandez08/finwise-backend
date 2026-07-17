import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Debt } from '../schemas/debt.schema';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

@Injectable()
export class DebtsService {
  constructor(@InjectModel(Debt.name) private debtModel: Model<Debt>) {}

  async create(createDto: CreateDebtDto) {
    // Validación de negocio: remaining_amount <= total_amount
    if (createDto.remaining_amount > createDto.total_amount) {
      throw new BadRequestException('remaining_amount cannot exceed total_amount');
    }
    const newDebt = new this.debtModel(createDto);
    return newDebt.save();
  }

  async findAll() {
    return this.debtModel.find().exec();
  }

  async findOne(id: string) {
    const debt = await this.debtModel.findById(id).exec();
    if (!debt) {
      throw new NotFoundException(`Debt with ID ${id} not found`);
    }
    return debt;
  }

  // Método adicional: obtener deudas de un usuario
  async findByUser(user_id: string) {
    return this.debtModel.find({ user_id }).exec();
  }

  // Método para actualizar el saldo restante (usado al hacer pagos)
  async updateRemainingAmount(debtId: string, newRemaining: number) {
    const debt = await this.findOne(debtId);
    if (newRemaining > debt.total_amount) {
      throw new BadRequestException('remaining_amount cannot exceed total_amount');
    }
    if (newRemaining < 0) {
      throw new BadRequestException('remaining_amount cannot be negative');
    }
    debt.remaining_amount = newRemaining;
    return debt.save();
  }

  async update(id: string, updateDto: UpdateDebtDto) {
    // Validar si se está actualizando remaining_amount o total_amount
    if (updateDto.remaining_amount !== undefined || updateDto.total_amount !== undefined) {
      // Para una validación completa, necesitaríamos obtener el documento actual.
      // Lo hacemos con findOne y luego actualizamos.
      const debt = await this.findOne(id);
      const newTotal = updateDto.total_amount ?? debt.total_amount;
      const newRemaining = updateDto.remaining_amount ?? debt.remaining_amount;
      if (newRemaining > newTotal) {
        throw new BadRequestException('remaining_amount cannot exceed total_amount');
      }
      // Actualizamos con los valores validados
      return this.debtModel.findByIdAndUpdate(id, updateDto, { new: true, runValidators: true }).exec();
    } else {
      // Si no se actualizan esos campos, simplemente actualizamos
      const updated = await this.debtModel.findByIdAndUpdate(id, updateDto, { new: true, runValidators: true }).exec();
      if (!updated) {
        throw new NotFoundException(`Debt with ID ${id} not found`);
      }
      return updated;
    }
  }

  async remove(id: string) {
    const result = await this.debtModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Debt with ID ${id} not found`);
    }
    return result;
  }
}