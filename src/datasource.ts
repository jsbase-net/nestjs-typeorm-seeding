import { TYPE_ORM_MODULE_OPTIONS } from './nestjs-typeorm-seeding.config';
import { DataSource, DataSourceOptions } from 'typeorm';

const DataSourceInstance = new DataSource(
  TYPE_ORM_MODULE_OPTIONS as DataSourceOptions,
);

export default DataSourceInstance;
