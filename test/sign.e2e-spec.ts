import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('SignController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/sign (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/sign').expect(200);
    expect(res.body).toHaveProperty('signature');
    expect(res.body.signature).toMatch(/^0x[0-9a-fA-F]+$/);
  });
});

