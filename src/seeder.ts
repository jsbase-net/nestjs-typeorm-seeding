import { INestApplicationContext } from '@nestjs/common';
import { ISeeder } from './interfaces';

export class Seeder implements ISeeder {
  appInstance: INestApplicationContext;
  path: string;
  name: string;
  ['constructor']({
    appInstance,
    path,
    name,
  }: {
    appInstance: INestApplicationContext;
    path: string;
    name: string;
  }) {
    this.appInstance = appInstance;
    this.path = path;
    this.name = name;
  }
  run(): Promise<any> {
    return;
  }
}
