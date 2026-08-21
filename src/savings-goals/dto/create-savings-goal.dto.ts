import { IsMongoId, IsString, IsNumber, Min, IsOptional, IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSavingsGoalDto {
  @IsOptional() // 👈 Ahora opcional, se asigna en el controlador
  @IsMongoId({ message: 'user_id debe ser un ObjectId válido' })
  user_id?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del objetivo es requerido' })
  name: string;

  @IsNumber()
  @Min(0.01, { message: 'El monto objetivo debe ser mayor a 0' })
  target_amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  current_amount?: number; // opcional, por defecto 0

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deadline?: Date;
}