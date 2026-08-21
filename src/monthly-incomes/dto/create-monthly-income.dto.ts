import { IsMongoId, IsNumber, Min, Max, IsInt, IsOptional } from 'class-validator';

export class CreateMonthlyIncomeDto {
  @IsOptional() // opcional, se asigna en el controlador
  @IsMongoId({ message: 'user_id debe ser un ObjectId válido' })
  user_id?: string;

  @IsNumber()
  @Min(0, { message: 'El monto debe ser mayor o igual a 0' })
  amount: number;

  @IsInt()
  @Min(1, { message: 'El mes debe estar entre 1 y 12' })
  @Max(12, { message: 'El mes debe estar entre 1 y 12' })
  month: number;

  @IsInt()
  @Min(2000, { message: 'El año debe ser válido' })
  year: number;
}