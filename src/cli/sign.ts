import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SignerFactoryService, SignerType } from '../signer/signer.factory.service';

async function main() {
  const typeArg = process.argv.find((a) => a.startsWith('--type='));
  const type = (typeArg?.split('=')[1] || process.env.SIGNER_TYPE || 'private') as SignerType;

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const factory = app.get(SignerFactoryService);
  const signer = factory.getSigner(type);

  const signature = await signer.sign('abc');
  console.log(signature);

  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
