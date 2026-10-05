import { IsMongoId, IsNumber, Min, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateExpenseDto {
  @IsMongoId()
  user_id: string;

  @IsMongoId()
  category_id: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  date: string; // formato YYYY-MM-DD

  @IsMongoId()
  @IsOptional()
  debt_id?: string; // opcional
}