import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';

/** Campos que nunca deben salir de la API. */
const WITHOUT_PASSWORD = '-password_hash -__v';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // ========== Lectura segura (lo que se expone por HTTP) ==========

  // Perfil del usuario sin el hash de la contrasena
  async findProfile(id: string): Promise<User | null> {
    return this.userModel.findById(id).select(WITHOUT_PASSWORD).exec();
  }

  // ========== Métodos específicos para autenticación ==========
  // Buscar por id (uso interno: validación del token)
  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).select(WITHOUT_PASSWORD).exec();
  }

  // Buscar por email (devuelve null si no existe). Incluye password_hash
  // porque lo usa la validación de credenciales; no se expone nunca tal cual.
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Crear usuario con contraseña (para registro con email/password)
  async createWithPassword(email: string, password: string, fullName: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      email,
      password_hash: hashedPassword,
      full_name: fullName,
    });
    return newUser.save();
  }

  // Crear usuario desde Google (sin contraseña)
  async createWithGoogle(email: string, fullName: string, googleId: string): Promise<User> {
    const newUser = new this.userModel({
      email,
      full_name: fullName,
      google_id: googleId,
    });
    return newUser.save();
  }

  // Actualizar google_id de un usuario existente
  async updateGoogleId(userId: string, googleId: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { google_id: googleId },
      { new: true },
    ).exec();
  }

  // Validar credenciales (para login con email/password)
  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && user.password_hash && await bcrypt.compare(password, user.password_hash)) {
      return user;
    }
    return null;
  }
}
