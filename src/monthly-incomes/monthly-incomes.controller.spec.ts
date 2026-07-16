import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyIncomesController } from './monthly-incomes.controller';
import { MonthlyIncomesService } from './monthly-incomes.service';

describe('MonthlyIncomesController', () => {
  let controller: MonthlyIncomesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonthlyIncomesController],
      providers: [MonthlyIncomesService],
    }).compile();

    controller = module.get<MonthlyIncomesController>(MonthlyIncomesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
