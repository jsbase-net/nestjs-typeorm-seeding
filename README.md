# NestJS TypeORM Seeding

![Belong to NextJSVietNam](https://nextjsvietnam.com/themes/2022/src/assets/images/logo.png)

## Usage

**Create config file**

> **nestjs-typeorm-seeding.config.ts**

```ts
// nestjs-typeorm-seeding.config.ts
import path from 'path';
import { UserEntity } from 'src/example/user.entity';

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

export { SEED_PATHS, TYPE_ORM_MODULE_OPTIONS, SEEDS_TABLE_NAME };
```

## Development

1. [x] Seed CLI

```sh
npm i commander chalk
```

2. [x] TypeORM with mysql2

```sh
npm install --save @nestjs/typeorm typeorm mysql2
```

3. [x] Test

```sh
npm run build
node ./dist/seed.js -c ./dist/nestjs-typeorm-seeding.config.js list
node ./dist/seed.js -c ./dist/nestjs-typeorm-seeding.config.js -d ./src/seeds generate users
```
