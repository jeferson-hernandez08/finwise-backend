import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DebtPaymentsService } from './debt-payments.service';
import { DebtPaymentsController } from './debt-payments.controller';
import { DebtPayment, DebtPaymentSchema } from '../schemas/debt-payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DebtPayment.name, schema: DebtPaymentSchema }
    ])
  ],
  controllers: [DebtPaymentsController],
  providers: [DebtPaymentsService],
})
export class DebtPaymentsModule {}