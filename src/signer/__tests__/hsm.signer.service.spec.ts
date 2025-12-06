import { Test, TestingModule } from '@nestjs/testing';
import { HSMSignerService } from '../../signer/hsm.signer.service';

describe('HSMSignerService', () => {
  let service: HSMSignerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HSMSignerService],
    }).compile();
    service = module.get<HSMSignerService>(HSMSignerService);
  });

  it('throws not implemented', async () => {
    await expect(service.sign('abc')).rejects.toThrow();
  });
});

