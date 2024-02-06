import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { INestJSTypeORMSeed } from './interfaces';
import { INestApplicationContext } from '@nestjs/common';

export class NestJSTypeORMSeed implements INestJSTypeORMSeed {
  seedsPath: string;
  appInstance: INestApplicationContext;
  constructor({
    seedsPath,
    appInstance,
  }: {
    seedsPath: string;
    appInstance: INestApplicationContext;
  }) {
    this.seedsPath = seedsPath;
    this.appInstance = appInstance;
  }
}
