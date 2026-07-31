import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavingsContributionsService } from './savings-contributions.service';
import { SavingsContributionsController } from './savings-contributions.controller';
import { SavingsContribution, SavingsContributionSchema } from '../schemas/savings-contribution.schema';
import { SavingsGoal, SavingsGoalSchema } from '../schemas/savings-goal.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavingsContribution.name, schema: SavingsContributionSchema },
      { name: SavingsGoal.name, schema: SavingsGoalSchema }, // Necesario para actualizar el objetivo
    ]),
  ],
  controllers: [SavingsContributionsController],
  providers: [SavingsContributionsService],
})
export class SavingsContributionsModule {}