import { Injectable } from '@nestjs/common';
import { ISigner } from './isigner';
import { PrivateKeySignerService } from './private-key.signer.service';
import { MPCSignerService } from './mpc.signer.service';
import { HSMSignerService } from './hsm.signer.service';

export enum SignerType {
  PRIVATE = 'private',
  MPC = 'mpc',
  HSM = 'hsm',
}

@Injectable()
export class SignerFactoryService {
  constructor(
    private readonly privateSigner: PrivateKeySignerService,
    private readonly mpcSigner: MPCSignerService,
    private readonly hsmSigner: HSMSignerService,
  ) {}

  getSigner(type: SignerType): ISigner {
    switch (type) {
      case SignerType.PRIVATE:
        return this.privateSigner;
      case SignerType.MPC:
        return this.mpcSigner;
      case SignerType.HSM:
        return this.hsmSigner;
      default:
        throw new Error(`Unknown signer type`);
    }
  }
}
