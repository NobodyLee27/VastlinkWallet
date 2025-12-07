import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SignerModule } from './signer/signer.module';
import { SignController } from './sign/sign.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env'],
    }),
    SignerModule,
  ],
  controllers: [AppController, SignController],
  providers: [AppService],
})
export class AppModule {}
