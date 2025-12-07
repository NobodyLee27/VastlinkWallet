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

  it('sign("abc") returns hex-like string', async () => {
    const sig = await service.sign('abc');
    expect(sig).toMatch(/^0x[0-9a-fA-F]+$/);
  });
});
