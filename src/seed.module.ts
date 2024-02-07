import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SeedEntity } from './entities/seed.entity';

@Module({})
export class SeedModule {
  static register(options: TypeOrmModuleOptions): DynamicModule {
    return {
      module: SeedModule,
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: () => {
            return options;
          },
          dataSourceFactory: async (opts) => {
            let entities = [SeedEntity];
            if (opts.entities) {
              entities = [...(opts.entities as any), ...entities];
            }
            const dataSource = await new DataSource({
              ...opts,
              entities,
            });
            return dataSource;
          },
        }),
      ],
    };
  }
}
