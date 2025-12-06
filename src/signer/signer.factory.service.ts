import { Injectable } from '@nestjs/common';
import { ISigner } from './isigner';
import { PrivateKeySignerService } from './private-key.signer.service';
import { MPCSignerService } from './mpc.signer.service';
import { HSMSignerService } from './hsm.signer.service';

export type SignerType = 'private' | 'mpc' | 'hsm';

@Injectable()
export class SignerFactoryService {
  constructor(
    private readonly privateSigner: PrivateKeySignerService,
    private readonly mpcSigner: MPCSignerService,
    private readonly hsmSigner: HSMSignerService,
  ) {}

  getSigner(type: SignerType): ISigner {
    switch (type) {
      case 'private':
        return this.privateSigner;
      case 'mpc':
        return this.mpcSigner;
      case 'hsm':
        return this.hsmSigner;
      default:
        throw new Error(`Unknown signer type: ${type}`);
    }
  }
}

