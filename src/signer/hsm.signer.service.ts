import { Injectable } from '@nestjs/common';
import { ISigner } from './isigner';

@Injectable()
export class HSMSignerService implements ISigner {
  private readonly _hsmClient: unknown;

  constructor() {
    this._hsmClient = undefined;
  }

  sign(message: string): Promise<string> {
    void message;
    void this._hsmClient;
    return Promise.resolve(
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    );
  }
}
