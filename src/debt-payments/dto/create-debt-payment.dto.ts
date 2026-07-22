import { IsMongoId, IsNumber, Min, IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDebtPaymentDto {
  @IsMongoId({ message: 'debt_id debe ser un ObjectId válido' })
  debt_id: string;

  @IsNumber()
  @Min(0, { message: 'El monto debe ser mayor o igual a 0' })
  amount: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty({ message: 'La fecha de pago es requerida' })
  payment_date: Date;
}