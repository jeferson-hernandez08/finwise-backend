import { IsMongoId, IsNumber, Min, Max, IsInt } from 'class-validator';

export class CreateMonthlyIncomeDto {
  @IsMongoId({ message: 'user_id must be a valid MongoDB ObjectId' })
  user_id: string;

  @IsNumber()
  @Min(0, { message: 'amount must be greater than or equal to 0' })
  amount: number;

  @IsInt()
  @Min(1, { message: 'month must be between 1 and 12' })
  @Max(12, { message: 'month must be between 1 and 12' })
  month: number;

  @IsInt()
  @Min(2000, { message: 'year must be a valid year' })
  year: number;
}