import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

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
            const dataSource = await new DataSource(opts);
            return dataSource;
          },
        }),
      ],
    };
  }
}
