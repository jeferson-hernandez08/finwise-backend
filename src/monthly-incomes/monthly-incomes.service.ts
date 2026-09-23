import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MonthlyIncome } from '../schemas/monthly-income.schema';
import { CreateMonthlyIncomeDto } from './dto/create-monthly-income.dto';
import { UpdateMonthlyIncomeDto } from './dto/update-monthly-income.dto';

@Injectable()
export class MonthlyIncomesService {
  constructor(
    @InjectModel(MonthlyIncome.name) private monthlyIncomeModel: Model<MonthlyIncome>,
  ) {}

  // ========== MÉTODOS CON FILTRO POR USUARIO ==========

  // 1. Crear ingreso (el DTO ya contiene user_id)
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

  // 2. Listar todos los ingresos de un usuario
  async findAllByUser(userId: string) {
    return this.monthlyIncomeModel.find({ user_id: userId }).sort({ year: -1, month: -1 }).exec();
  }

  // 3. Buscar ingreso por usuario, año y mes (uso interno: lanza si no existe)
  async findByUserAndMonth(userId: string, year: number, month: number) {
    const income = await this.findByUserAndMonthOrNull(userId, year, month);
    if (!income) {
      throw new NotFoundException(
        `No se encontró ingreso para el mes ${month} del año ${year}`
      );
    }
    return income;
  }

  // 3-bis. Igual que el anterior pero devuelve null: no registrar ingreso en un
  // mes es lo normal, no un error, y así el frontend no recibe un 404.
  async findByUserAndMonthOrNull(userId: string, year: number, month: number) {
    return this.monthlyIncomeModel.findOne({ user_id: userId, year, month }).exec();
  }

  // 4. Obtener un ingreso por ID verificando propiedad
  async findOneForUser(id: string, userId: string) {
    const income = await this.monthlyIncomeModel.findOne({ _id: id, user_id: userId }).exec();
    if (!income) {
      throw new NotFoundException(
        'Ingreso mensual no encontrado o no pertenece al usuario'
      );
    }
    return income;
  }

  // 5. Actualizar ingreso (verifica propiedad)
  async updateForUser(id: string, updateDto: UpdateMonthlyIncomeDto, userId: string) {
    // Verificar que el ingreso exista y pertenezca al usuario
    const current = await this.findOneForUser(id, userId);

    // Si se actualiza el año/mes, verificar que no haya conflicto de unicidad.
    // Hay que combinar el DTO con el documento actual: con `undefined` el filtro
    // se ignora y la comprobación daba falsos positivos.
    if (updateDto.year !== undefined || updateDto.month !== undefined) {
      const year = updateDto.year ?? current.year;
      const month = updateDto.month ?? current.month;
      const existing = await this.monthlyIncomeModel.findOne({
        user_id: userId,
        year,
        month,
        _id: { $ne: id }, // Excluir el propio documento
      }).exec();
      if (existing) {
        throw new ConflictException(
          `Ya existe un ingreso para el mes ${month} del año ${year}`
        );
      }
    }

    // user_id no se toca desde el cuerpo de la petición.
    const { user_id: _ignored, ...fields } = updateDto;
    const updated = await this.monthlyIncomeModel
      .findOneAndUpdate({ _id: id, user_id: userId }, fields, {
        new: true,
        runValidators: true,
      })
      .exec();
    if (!updated) {
      throw new NotFoundException('Ingreso mensual no encontrado');
    }
    return updated;
  }

  // 6. Eliminar ingreso (verifica propiedad)
  async removeForUser(id: string, userId: string) {
    // Verificar que el ingreso exista y pertenezca al usuario
    await this.findOneForUser(id, userId);
    const result = await this.monthlyIncomeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Ingreso mensual no encontrado');
    }
    return result;
  }
}