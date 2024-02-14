// nestjs-typeorm-seeding.config.ts
import path from 'path';
import { UserEntity } from 'src/example/user.entity';
import { UserRepository } from './repositories/user-repository';

const dirname = __dirname;
const entities = [UserEntity];
const SEED_PATHS = path.resolve(__dirname, 'seeds');
const TYPE_ORM_MODULE_OPTIONS = {
  type: 'mysql',
  url: 'mysql://root:123456@localhost:3306/nestjs_typeorm_seeding',
  entities,
  // MYSQL will store Timestamp in GMT ( UTC = 0)
  timezone: 'Z', // must have this, if the response date will be marked as current timezone
  charset: 'utf8mb4_unicode_ci',
  // must not be synchronize automaticall, use data migration instea
  synchronize: false,
  // migrations
  migrations: [`${dirname}/database/migrations/*.ts`],
  migrationsTableName: `migrations`,
};
const SEEDS_TABLE_NAME = 'nestjs_typeorm_seeding';
const SEEDS_PROVIDERS = [UserRepository];

export {
  SEED_PATHS,
  TYPE_ORM_MODULE_OPTIONS,
  SEEDS_TABLE_NAME,
  SEEDS_PROVIDERS,
};
