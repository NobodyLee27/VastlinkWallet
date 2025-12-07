import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  SignerFactoryService,
  SignerType,
} from '../signer/signer.factory.service';

@Controller('sign')
export class SignController {
  constructor(private readonly factory: SignerFactoryService) {}

  private normalizeType(input?: SignerType): SignerType {
    return input && Object.values(SignerType).includes(input)
      ? input
      : SignerType.PRIVATE;
  }

  @Get()
  async get(
    @Query('type') type?: SignerType,
    @Query('message') message?: string,
  ) {
    const t = this.normalizeType(type);
    const msg = message ?? 'abc';
    const signer = this.factory.getSigner(t);
    const signature = await signer.sign(msg);
    return { type: t, message: msg, signature };
  }

  @Post()
  async post(@Body() body: { type?: SignerType; message?: string }) {
    const bt = body?.type;
    const t = this.normalizeType(bt);
    const msg = body?.message ?? 'abc';
    const signer = this.factory.getSigner(t);
    const signature = await signer.sign(msg);
    return { type: t, message: msg, signature };
  }
}
