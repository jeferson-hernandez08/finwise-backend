import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DebtPaymentsService } from './debt-payments.service';
import { DebtPaymentsController } from './debt-payments.controller';
import { DebtPayment, DebtPaymentSchema } from '../schemas/debt-payment.schema';
import { Debt, DebtSchema } from '../schemas/debt.schema'; // <--- Importa el esquema de Debt

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DebtPayment.name, schema: DebtPaymentSchema },
      { name: Debt.name, schema: DebtSchema }, // <--- Agrega Debt aquí
    ])
  ],
  controllers: [DebtPaymentsController],
  providers: [DebtPaymentsService],
})
export class DebtPaymentsModule {}