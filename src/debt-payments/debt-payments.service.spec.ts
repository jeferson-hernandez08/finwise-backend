import { Test, TestingModule } from '@nestjs/testing';
import { DebtPaymentsService } from './debt-payments.service';

describe('DebtPaymentsService', () => {
  let service: DebtPaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DebtPaymentsService],
    }).compile();

    service = module.get<DebtPaymentsService>(DebtPaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
