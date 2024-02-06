import path from 'path';
import { NestJSTypeORMSeed } from './nestjs-typeorm-seeding';

(async () => {
  const configPath = path.resolve(
    '.',
    'src',
    'nestjs-typeorm-seeding.config.ts',
  );
  const nestjsTypeORMSeed = new NestJSTypeORMSeed(configPath);
  await nestjsTypeORMSeed.init();
  const seeders = nestjsTypeORMSeed.list();
  console.log(seeders);
  process.exit(1);
})();
