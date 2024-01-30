#!/usr/bin/env node
import { program } from 'commander';
import { NestJSTypeORMSeed } from './nestjs-typeorm-seeding';
import * as path from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as fg from 'fast-glob';
import * as fs from 'fs';

const configFilePath = path.resolve('.', '.nestjstypeormseeding.config.json');

const readConfigFile = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    fs.readFile(configFilePath, 'utf-8', (error, data) => {
      if (error) {
        return reject(error);
      }
      return resolve(JSON.parse(data));
    });
  });
};

(async () => {
  const configValues: {
    seedsPath: string;
    typeormOptions: TypeOrmModuleOptions;
  } = await readConfigFile();
  const nestjsTypeORMSeed = new NestJSTypeORMSeed({
    seedsPath: configValues.seedsPath,
    typeormOptions: configValues.typeormOptions,
  });
  console.log(nestjsTypeORMSeed.seedsPath, nestjsTypeORMSeed.typeormOptions);
  // check seeds
  const patterns = [
    fg.convertPathToPattern(
      path.resolve('.', configValues.seedsPath, `*.seed.[js|ts]`),
    ),
  ];
  console.log(configValues);

  program
    .command('list')
    .description('List all the TODO tasks')
    .action(() => {
      console.log('list', patterns);
    });
  program.parse();
})();
