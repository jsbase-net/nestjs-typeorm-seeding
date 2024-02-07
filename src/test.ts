import { NestJSTypeORMSeed } from './nestjs-typeorm-seeding';

(async () => {
  const configPath = './src/nestjs-typeorm-seeding.config';
  const nestjsTypeORMSeed = new NestJSTypeORMSeed(configPath);
  await nestjsTypeORMSeed.init();
  const seeders = nestjsTypeORMSeed.list();
  await nestjsTypeORMSeed.run('tada');
  console.log(seeders);
  process.exit(1);
})();
