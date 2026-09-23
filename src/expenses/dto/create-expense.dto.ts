import {
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateExpenseDto {
  // Opcional: el controlador lo sobrescribe con el id del token, y el
  // ValidationPipe corre antes que el controlador.
  @IsOptional()
  @IsMongoId({ message: 'user_id debe ser un ObjectId válido' })
  user_id?: string;

  @IsMongoId({ message: 'category_id debe ser un ObjectId válido' })
  category_id: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  date: string; // formato YYYY-MM-DD

  // El frontend envía debt_id: null cuando el gasto no paga ninguna deuda.
  @ValidateIf((o) => o.debt_id !== null && o.debt_id !== undefined)
  @IsMongoId({ message: 'debt_id debe ser un ObjectId válido' })
  debt_id?: string | null;
}
