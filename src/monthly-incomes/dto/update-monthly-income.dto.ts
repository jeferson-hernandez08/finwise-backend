import { PartialType } from '@nestjs/mapped-types';
import { CreateMonthlyIncomeDto } from './create-monthly-income.dto';

export class UpdateMonthlyIncomeDto extends PartialType(CreateMonthlyIncomeDto) {}