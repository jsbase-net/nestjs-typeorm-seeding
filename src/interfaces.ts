import { INestApplicationContext } from '@nestjs/common';

export interface INestJSTypeORMSeed {}

export interface ISeeder {
  constructor({
    appInstance,
    path,
    name,
  }: {
    appInstance: INestApplicationContext;
    path: string;
    name: string;
  });
  run(): Promise<any>;
}
