import { Injectable } from '@nestjs/common';
import { ISigner } from './isigner';

@Injectable()
export class HSMSignerService implements ISigner {
  // Placeholder for an HSM client (e.g., PKCS#11)
  private readonly hsmClient: unknown;

  constructor() {
    this.hsmClient = undefined;
  }

  async sign(_message: string): Promise<string> {
    throw new Error('HSMSignerService.sign is not implemented');
  }
}
