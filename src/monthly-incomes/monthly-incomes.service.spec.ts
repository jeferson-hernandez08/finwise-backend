import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyIncomesService } from './monthly-incomes.service';

describe('MonthlyIncomesService', () => {
  let service: MonthlyIncomesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonthlyIncomesService],
    }).compile();

    service = module.get<MonthlyIncomesService>(MonthlyIncomesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
