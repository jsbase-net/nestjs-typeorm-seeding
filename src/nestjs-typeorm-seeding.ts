import { INestJSTypeORMSeed, ISeeder } from './interfaces';
import { INestApplicationContext } from '@nestjs/common';
import { SeedModule } from './seed.module';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fg from 'fast-glob';
import * as path from 'path';

export class NestJSTypeORMSeed implements INestJSTypeORMSeed {
  seedsPath: string;
  appInstance: INestApplicationContext;
  configPath: string;
  seeders: Array<{
    seeder: ISeeder;
    name: string;
    path: string;
  }> = [];
  constructor(configPath: string) {
    this.configPath = configPath;
  }
  /**
   * Load configuration, seeds from config path
   */
  async init() {
    const { SEED_PATHS, TYPE_ORM_MODULE_OPTIONS } = await import(
      this.configPath
    );
    this.seedsPath = SEED_PATHS;
    const seedModule = SeedModule.register(TYPE_ORM_MODULE_OPTIONS);
    const app = await NestFactory.create<NestExpressApplication>(seedModule);
    const appInstance = app.select(seedModule);
    const patterns = [
      fg.convertPathToPattern(
        path.resolve('.', this.seedsPath, `*.seed.[js|ts]`),
      ),
    ];
    const seeders = await fg.async(patterns, {});
    for (const path of seeders) {
      const importedSeed = await import(path);
      if (importedSeed.default) {
        const seederInstance: ISeeder = new importedSeed.default(appInstance);
        this.seeders.push({
          seeder: seederInstance,
          name: importedSeed.default.name,
          path: path,
        });
      }
    }
  }
  generateSeeder(name: string) {}
  list() {
    return this.seeders.map((seeder) => {
      return {
        name: seeder.name,
        path: seeder.path,
      };
    });
  }
}
