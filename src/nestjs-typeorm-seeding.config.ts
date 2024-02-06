import { UserEntity } from 'src/example/user.entity';

const entities = [UserEntity];
const SEED_PATHS = './seeds';
const TYPE_ORM_MODULE_OPTIONS = {
  type: 'mysql',
  url: 'mysql://root:123456@localhost:3306/nestjs_typeorm_seeding',
  entities,
  // MYSQL will store Timestamp in GMT ( UTC = 0)
  timezone: 'Z', // must have this, if the response date will be marked as current timezone
  charset: 'utf8mb4_unicode_ci',
  // must not be synchronize automaticall, use data migration instea
  synchronize: false,
};

export { SEED_PATHS, TYPE_ORM_MODULE_OPTIONS };
