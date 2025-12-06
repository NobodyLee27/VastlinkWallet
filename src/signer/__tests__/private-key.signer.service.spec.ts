import { ConfigService } from '@nestjs/config';
import { PrivateKeySignerService } from '../../signer/private-key.signer.service';
import { randomBytes } from 'crypto';

describe('PrivateKeySignerService', () => {
  let service: PrivateKeySignerService;

  beforeAll(() => {
    process.env.PRIVATE_KEY = `0x${randomBytes(32).toString('hex')}`;
  });

  beforeEach(() => {
    const mockConfig = {
      get: (key: string) =>
        key === 'PRIVATE_KEY' ? process.env.PRIVATE_KEY : undefined,
    } as unknown as ConfigService;
    service = new PrivateKeySignerService(mockConfig);
  });

  it('sign("abc") returns hex signature', async () => {
    const sig = await service.sign('abc');
    expect(sig).toMatch(/^0x[0-9a-fA-F]+$/);
    expect(sig.length).toBeGreaterThanOrEqual(66);
  });
});
