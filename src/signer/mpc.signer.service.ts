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
    const networkName =
      this.config.get<string>('signer.litNetwork') ??
      this.config.get<string>('LIT_NETWORK') ??
      'DatilDev';
    const litNetwork =
      LIT_NETWORK[networkName as keyof typeof LIT_NETWORK] ??
      LIT_NETWORK.DatilDev;

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

    const ethPriv =
      this.config.get<string>('signer.ethPrivateKey') ??
      this.config.get<string>('ETHEREUM_PRIVATE_KEY');
    if (!ethPriv) {
      throw new Error('ETHEREUM_PRIVATE_KEY is not configured');
    }

    const pkpPublicKey =
      this.config.get<string>('signer.pkpPublicKey') ??
      this.config.get<string>('LIT_PKP_PUBLIC_KEY');
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
      authNeededCallback: async ({
        uri,
        expiration,
        resourceAbilityRequests,
      }) => {
        const toSign = await createSiweMessage({
          uri: uri!,
          expiration: expiration!,
          resources: resourceAbilityRequests!,
          walletAddress: wallet.address,
          nonce: await this.litClient.getLatestBlockhash(),
          litNodeClient: this.litClient,
        });
        return await generateAuthSig({ signer: wallet, toSign });
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

    const responseText =
      typeof res.response === 'string'
        ? res.response
        : JSON.stringify(res.response);
    const parsed: unknown = JSON.parse(responseText);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid signature response');
    }
    const rec = parsed as Record<string, unknown>;
    const rVal = rec['r'];
    const sVal = rec['s'];
    const recidVal = rec['recid'];
    if (typeof rVal !== 'string' || typeof sVal !== 'string') {
      throw new Error('Invalid signature fields');
    }
    const r = `0x${rVal}`;
    const s = `0x${sVal}`;
    const v =
      typeof recidVal === 'number' ? recidVal + 27 : Number(recidVal) + 27;
    const joined = ethers.utils.joinSignature({ r, s, v });
    return joined;
  }
}
