import { Module } from '@nestjs/common';
import { PrivateKeySignerService } from './private-key.signer.service';
import { MPCSignerService } from './mpc.signer.service';
import { HSMSignerService } from './hsm.signer.service';
import { SignerFactoryService } from './signer.factory.service';

@Module({
  imports: [],
  providers: [
    { provide: 'ISigner', useExisting: PrivateKeySignerService },
    PrivateKeySignerService,
    MPCSignerService,
    HSMSignerService,
    SignerFactoryService,
  ],
  exports: [
    PrivateKeySignerService,
    MPCSignerService,
    HSMSignerService,
    SignerFactoryService,
  ],
})
export class SignerModule {}
