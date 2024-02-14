import { INestJSTypeORMSeed, ISeeder } from './interfaces';
import { INestApplicationContext } from '@nestjs/common';
import { SeedModule } from './seed.module';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fg from 'fast-glob';
import * as path from 'path';
import * as fs from 'fs';
import { TypeOrmModuleOptions, getDataSourceToken } from '@nestjs/typeorm';
import { SeedEntity } from './entities/seed.entity';
import { Table, TableColumn } from 'typeorm';
import { SEEDS_TABLE_NAME } from './nestjs-typeorm-seeding.config';
import { Seeder } from './seeder';

export class NestJSTypeORMSeed implements INestJSTypeORMSeed {
  seedsPath: string;
  appInstance: INestApplicationContext;
  configPath: string;
  seeders: Array<{
    seeder: ISeeder;
    name: string;
    path: string;
  }> = [];
  typeOrmModuleOptions: TypeOrmModuleOptions = null;
  constructor(configPath: string) {
    this.configPath = path.resolve('.', configPath);
  }
  /**
   * Load configuration, seeds from config path
   */
  async init() {
    const { SEED_PATHS, TYPE_ORM_MODULE_OPTIONS, SEEDS_PROVIDERS } =
      await import(this.configPath);
    console.error('configPath', this.configPath);
    this.seedsPath = SEED_PATHS;
    this.typeOrmModuleOptions = TYPE_ORM_MODULE_OPTIONS;
    const seedModule = SeedModule.register({
      options: TYPE_ORM_MODULE_OPTIONS,
      providers: SEEDS_PROVIDERS,
    });
    const app = await NestFactory.create<NestExpressApplication>(seedModule);
    this.appInstance = app.select(seedModule);
    const patterns = [
      `${this.seedsPath}/*.seed.ts`,
      `${this.seedsPath}/*.seed.js`,
      fg.convertPathToPattern(`${this.seedsPath}/*.seed.ts`),
      fg.convertPathToPattern(`${this.seedsPath}/*.seed.js`),
    ];
    const seeders = await fg.async(patterns, {});
    console.error('seeders', seeders, patterns);
    for (const path of seeders) {
      const importedSeed = await import(path);
      if (importedSeed.default) {
        const seederInstance: Seeder = new importedSeed.default(
          this.appInstance,
          path,
          importedSeed.default.name,
        );
        this.seeders.push({
          seeder: seederInstance,
          name: seederInstance.name,
          path: seederInstance.path,
        });
      }
    }
    // create seeder table if not existed
    const dataSource = this.appInstance.get(getDataSourceToken());
    let queryRunner = dataSource.createQueryRunner();
    // create table
    const existedTable = await queryRunner.getTable(SEEDS_TABLE_NAME);
    const seedsTableName = SEEDS_TABLE_NAME;
    if (existedTable) {
      return;
    }
    await queryRunner.startTransaction();
    try {
      console.log('Try to create a seed table!');

      await queryRunner.createTable(
        new Table({
          name: seedsTableName,
          columns: [
            {
              name: 'id',
              type:
                this.typeOrmModuleOptions.type == 'mysql' ? 'int' : 'integer',
              isPrimary: true,
              isNullable: false,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'name',
              type: 'varchar',
              length: '1000',
            },
            {
              name: 'created_at',
              type: 'datetime',
              isNullable: false,
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updated_at',
              type: 'datetime',
              isNullable: false,
              default: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
      );
      console.log(`${seedsTableName} has been created!`);
      // commit transaction now:
      await queryRunner.commitTransaction();
    } catch (error) {
      // since we have errors let's rollback changes we made
      await queryRunner.rollbackTransaction();
      console.error('Seeds run failed!');
      console.error(error);
    } finally {
      console.error('Seeds run successfully!');
      // you need to release query runner which is manually created:
      await queryRunner.release();
    }
  }
  async generateSeeder(name: string, seeedDir: string = '') {
    const currentTimeStamp = Date.now();
    const seederFileName = `${currentTimeStamp}-${name.toLocaleLowerCase()}.seed.ts`;
    const templatePath = path.resolve(`${__dirname}`, 'seeder.template');
    const readFilePromise = new Promise((resolve, reject) => {
      fs.readFile(templatePath, (err, data) => {
        if (err) {
          return reject(err);
        }
        const seederClassName = `${name}${currentTimeStamp}`;
        const capitalizedSeederClassName =
          seederClassName.charAt(0).toUpperCase() + seederClassName.slice(1);
        const content = data
          .toString()
          .replace('{SeederClassName}', capitalizedSeederClassName);
        const newSeedFile = path.resolve(seeedDir, seederFileName);
        fs.writeFile(newSeedFile, content, (err) => {
          if (err) {
            return reject(err);
          }
          resolve(true);
        });
      });
    });
    await Promise.resolve(readFilePromise);
  }
  async list() {
    const dataSource = this.appInstance.get(getDataSourceToken());
    const seederRepository = dataSource.getRepository(SeedEntity);
    const completedSeeds = (await seederRepository.find()).flatMap(
      (seeder) => seeder.name,
    );
    const seeds = this.seeders.map((s) => {
      return {
        name: s.name,
        path: s.path,
        seeder: s.seeder,
        isCompleted: completedSeeds.includes(this.formatSeederName(s.name)),
      };
    });
    return seeds;
  }

  formatSeederName(name: string) {
    return name.toLowerCase().trim().replaceAll(' ', '');
  }

  async run(name: string = '') {
    const dataSource = this.appInstance.get(getDataSourceToken());
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    const seederRepository = dataSource.getRepository(SeedEntity);
    const seeders = await this.list();
    const targetSeeders = seeders.filter((s) => {
      const seederName = this.formatSeederName(name);
      if (seederName.length > 0) {
        return !s.isCompleted && s.name == seederName;
      }
      return !s.isCompleted;
    });
    if (targetSeeders.length === 0) {
      return;
    }
    try {
      // run specific seeder or run all pending seeder
      for (const s of targetSeeders) {
        await s.seeder.run();
        console.log(`${s.name} at ${s.path} had been run successfully!`);
        // insert new record in seeder table
        await seederRepository.insert({
          name: this.formatSeederName(s.name),
        });
      }
      // commit transaction now:
      await queryRunner.commitTransaction();
    } catch (error) {
      // since we have errors let's rollback changes we made
      await queryRunner.rollbackTransaction();
      console.error('Seeds run failed!');
      console.error(error);
    } finally {
      console.error('Seeds run successfully!');
      // you need to release query runner which is manually created:
      await queryRunner.release();
    }
    // close dataSource
    dataSource.destroy();
  }
}
