import { INestApplicationContext } from '@nestjs/common';
import { ISeeder } from './interfaces';

export abstract class Seeder implements ISeeder {
  appInstance: INestApplicationContext;
  path: string;
  name: string;
  constructor(
    appInstance: INestApplicationContext,
    path: string,
    name: string,
  ) {
    this.appInstance = appInstance;
    this.path = path;
    this.name = name;
  }
  abstract run(): Promise<any>;
}
