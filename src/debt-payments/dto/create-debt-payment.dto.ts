import { IsMongoId, IsNumber, Min, IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDebtPaymentDto {
  @IsMongoId({ message: 'debt_id debe ser un ObjectId válido de MongoDB' })
  debt_id: string;

  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  amount: number;

  @IsDate()
  @Type(() => Date)
  payment_date: Date;

  @IsOptional()
  @IsString()
  note?: string;
}