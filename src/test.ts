import { NestJSTypeORMSeed } from './nestjs-typeorm-seeding';

(async () => {
  const configPath = './src/nestjs-typeorm-seeding.config';
  const nestjsTypeORMSeed = new NestJSTypeORMSeed(configPath);
  await nestjsTypeORMSeed.init();
  const seeders = await nestjsTypeORMSeed.list();
  await nestjsTypeORMSeed.run();
  // await nestjsTypeORMSeed.generateSeeder('users');
  console.log(seeders);
  process.exit(1);
})();
