import { IsMongoId, IsString, IsNumber, Min, Max, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateDebtDto {
  @IsMongoId({ message: 'user_id must be a valid MongoDB ObjectId' })
  user_id: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsNumber()
  @Min(0, { message: 'total_amount must be >= 0' })
  total_amount: number;

  @IsNumber()
  @Min(0, { message: 'remaining_amount must be >= 0' })
  remaining_amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimum_monthly_payment?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  interest_rate?: number;

  @IsOptional()
  @IsDateString()
  due_date?: string; // ISO date string
}
