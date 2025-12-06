import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MPCSignerService } from '../../signer/mpc.signer.service';

const shouldRun =
  process.env.LIT_TEST === 'true' &&
  !!process.env.ETHEREUM_PRIVATE_KEY &&
  !!process.env.LIT_PKP_PUBLIC_KEY;

(shouldRun ? describe : describe.skip)('MPCSignerService', () => {
  let service: MPCSignerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [MPCSignerService],
    }).compile();

    service = module.get<MPCSignerService>(MPCSignerService);
  });

  it('sign("abc") returns hex signature via Lit', async () => {
    const sig = await service.sign('abc');
    expect(sig).toMatch(/^0x[0-9a-fA-F]+$/);
  });
});
