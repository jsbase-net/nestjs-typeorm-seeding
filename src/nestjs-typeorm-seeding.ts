import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { INestJSTypeORMSeed } from './interfaces';

export class NestJSTypeORMSeed implements INestJSTypeORMSeed {
  seedsPath: string;
  typeormOptions: TypeOrmModuleOptions;
  constructor({
    seedsPath,
    typeormOptions,
  }: {
    seedsPath: string;
    typeormOptions: TypeOrmModuleOptions;
  }) {
    this.seedsPath = seedsPath;
    this.typeormOptions = typeormOptions;
  }
}
