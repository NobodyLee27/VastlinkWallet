import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { ISigner } from './isigner';

@Injectable()
export class PrivateKeySignerService implements ISigner {
  private readonly wallet: ethers.Wallet;

  constructor(private readonly config: ConfigService) {
    const configured =
      this.config.get<string>('PRIVATE_KEY') ??
      ethers.Wallet.createRandom().privateKey;
    this.wallet = new ethers.Wallet(configured);
  }

  async sign(message: string): Promise<string> {
    return await this.wallet.signMessage(message);
  }
}
