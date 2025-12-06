import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISigner } from './isigner';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LIT_ABILITY, LIT_NETWORK, LIT_RPC } from '@lit-protocol/constants';
import {
  createSiweMessage,
  generateAuthSig,
  LitActionResource,
  LitPKPResource,
} from '@lit-protocol/auth-helpers';
import { ethers } from 'ethers';

@Injectable()
export class MPCSignerService implements ISigner {
  private readonly litClient: LitNodeClient;
  private connected = false;

  constructor(private readonly config: ConfigService) {
    const networkName = this.config.get<string>('LIT_NETWORK') ?? 'DatilDev';
    const litNetwork = (LIT_NETWORK as any)[networkName] ?? LIT_NETWORK.DatilDev;

    this.litClient = new LitNodeClient({
      litNetwork,
      debug: false,
    });
  }

  private async ensureConnected() {
    if (!this.connected) {
      await this.litClient.connect();
      this.connected = true;
    }
  }

  async sign(message: string): Promise<string> {
    await this.ensureConnected();

    const ethPriv = this.config.get<string>('ETHEREUM_PRIVATE_KEY');
    if (!ethPriv) {
      throw new Error('ETHEREUM_PRIVATE_KEY is not configured');
    }

    const pkpPublicKey = this.config.get<string>('LIT_PKP_PUBLIC_KEY');
    if (!pkpPublicKey) {
      throw new Error('LIT_PKP_PUBLIC_KEY is not configured');
    }

    const provider = new ethers.providers.JsonRpcProvider(
      LIT_RPC.CHRONICLE_YELLOWSTONE,
    );
    const wallet = new ethers.Wallet(ethPriv, provider);

    const sessionSigs = await this.litClient.getSessionSigs({
      chain: 'ethereum',
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
      resourceAbilityRequests: [
        { resource: new LitPKPResource('*'), ability: LIT_ABILITY.PKPSigning },
        {
          resource: new LitActionResource('*'),
          ability: LIT_ABILITY.LitActionExecution,
        },
      ],
      authNeededCallback: async ({ uri, expiration, resourceAbilityRequests }) => {
        const toSign = await createSiweMessage({
          uri: uri!,
          expiration: expiration!,
          resources: resourceAbilityRequests!,
          walletAddress: wallet.address,
          nonce: await this.litClient.getLatestBlockhash(),
          litNodeClient: this.litClient,
        });
        return await generateAuthSig({ signer: wallet as any, toSign });
      },
    });

    const toSignHex = ethers.utils.hashMessage(message);
    const sigName = 'sig1';

    const litActionCode = `
      (async () => {
        const signature = await Lit.Actions.signAndCombineEcdsa({ toSign, publicKey, sigName });
        Lit.Actions.setResponse({ response: signature });
      })();
    `;

    const res = await this.litClient.executeJs({
      code: litActionCode,
      sessionSigs,
      jsParams: {
        toSign: toSignHex,
        publicKey: pkpPublicKey,
        sigName,
      },
    });

    const jsonSignature = JSON.parse(res.response as string);
    const r = `0x${jsonSignature.r}`;
    const s = `0x${jsonSignature.s}`;
    const v = Number(jsonSignature.recid) + 27;
    const joined = ethers.utils.joinSignature({ r, s, v });
    return joined;
  }
}
