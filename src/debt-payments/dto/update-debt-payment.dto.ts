import { PartialType } from '@nestjs/mapped-types';
import { CreateDebtPaymentDto } from './create-debt-payment.dto';

export class UpdateDebtPaymentDto extends PartialType(CreateDebtPaymentDto) {}
