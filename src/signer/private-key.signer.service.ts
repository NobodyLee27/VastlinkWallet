import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { ISigner } from './isigner';

@Injectable()
export class PrivateKeySignerService implements ISigner {
  private readonly wallet: ethers.Wallet;

  constructor(private readonly config: ConfigService) {
    const privateKey = this.config.get<string>('PRIVATE_KEY');
    if (!privateKey) {
      throw new Error('PRIVATE_KEY is not configured');
    }
    this.wallet = new ethers.Wallet(privateKey);
  }

  async sign(message: string): Promise<string> {
    return await this.wallet.signMessage(message);
  }
}

