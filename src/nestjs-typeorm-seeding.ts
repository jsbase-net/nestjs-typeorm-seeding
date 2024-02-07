import { INestJSTypeORMSeed, ISeeder } from './interfaces';
import { INestApplicationContext } from '@nestjs/common';
import { SeedModule } from './seed.module';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fg from 'fast-glob';
import * as path from 'path';
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
    const { SEED_PATHS, TYPE_ORM_MODULE_OPTIONS } = await import(
      this.configPath
    );
    console.error('configPath', this.configPath);
    this.seedsPath = SEED_PATHS;
    this.typeOrmModuleOptions = TYPE_ORM_MODULE_OPTIONS;
    const seedModule = SeedModule.register(TYPE_ORM_MODULE_OPTIONS);
    const app = await NestFactory.create<NestExpressApplication>(seedModule);
    this.appInstance = app.select(seedModule);
    const patterns = [
      `${this.seedsPath}/*.seed.ts`,
      `${this.seedsPath}/*.seed.js`,
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
        console.log('seederInstance.appInstance', seederInstance.appInstance);
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
    await queryRunner.startTransaction();
    try {
      // create table
      const existedTable = await queryRunner.getTable(SEEDS_TABLE_NAME);
      const seedsTableName = SEEDS_TABLE_NAME;
      if (!existedTable) {
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
      }
      // run specific seeder or run all pending seeder

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
    // query db
    queryRunner = dataSource.createQueryRunner();
    const existedTable = await queryRunner.getTable(SEEDS_TABLE_NAME);
    if (existedTable) {
      const seedRepository = dataSource.getRepository(SeedEntity);
      const rows = await seedRepository.find({});
      console.log(rows);
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

  async run(name: string = '') {
    const dataSource = this.appInstance.get(getDataSourceToken());
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    const seederRepository = dataSource.getRepository(SeedEntity);
    try {
      // run specific seeder or run all pending seeder
      for (const s of this.seeders) {
        console.log('tada', s.name, s.seeder);
        await s.seeder.run();
        console.log(`${s.name} at ${s.path} had been run successfully!`);
        // insert new record in seeder table
        await seederRepository.insert({
          name: s.name,
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
