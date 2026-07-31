import { IsMongoId, IsNumber, Min, IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSavingsContributionDto {
  @IsMongoId({ message: 'savings_goal_id debe ser un ObjectId válido' })
  savings_goal_id: string;

  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  amount: number;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsOptional()
  @IsString()
  note?: string;
}