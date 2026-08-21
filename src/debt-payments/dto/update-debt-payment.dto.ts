import { IsOptional, IsString } from 'class-validator';

export class UpdateDebtPaymentDto {
  @IsOptional()
  @IsString()
  note?: string;
}