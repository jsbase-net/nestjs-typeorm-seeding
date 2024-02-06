#!/usr/bin/env node
import { program } from 'commander';
import { NestJSTypeORMSeed } from './nestjs-typeorm-seeding';
import * as path from 'path';

import * as fg from 'fast-glob';
import * as fs from 'fs';

import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';

const seedingConfigOptionsFilePath = path.resolve(
  '.',
  'src',
  'nestjs-typeorm-seeding.config.ts',
);

const readConfigFile = (configFile: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    fs.readFile(configFile, 'utf-8', (error, data) => {
      if (error) {
        return reject(error);
      }
      return resolve(JSON.parse(data));
    });
  });
};

(async () => {
  const { SEED_PATHS, TYPE_ORM_MODULE_OPTIONS } = await import(
    seedingConfigOptionsFilePath
  );
  const seedModule = SeedModule.register(TYPE_ORM_MODULE_OPTIONS);
  const app = await NestFactory.create<NestExpressApplication>(seedModule);
  const appInstance = app.select(seedModule);

  const nestjsTypeORMSeed = new NestJSTypeORMSeed({
    seedsPath: SEED_PATHS,
    appInstance,
  });
  console.log(nestjsTypeORMSeed.seedsPath, nestjsTypeORMSeed.appInstance);
  // check seeds
  const patterns = [
    fg.convertPathToPattern(path.resolve('.', SEED_PATHS, `*.seed.[js|ts]`)),
  ];

  program
    .command('list')
    .description('List all the TODO tasks')
    .action(() => {
      console.log('list', patterns);
    });
  program.parse();
})();
