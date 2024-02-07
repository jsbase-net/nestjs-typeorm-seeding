#!/usr/bin/env node
import { Command } from 'commander';
import { NestJSTypeORMSeed } from './nestjs-typeorm-seeding';

(async () => {
  const program = new Command();

  program
    .requiredOption('-c, --config <path>', 'path to your config file')
    .command('list')
    .action(async () => {
      console.log('options', program.opts());
      if (program.opts().config) {
        const nestjsTypeORMSeed = new NestJSTypeORMSeed(program.opts().config);
        await nestjsTypeORMSeed.init();
        const seeders = nestjsTypeORMSeed.list();
        console.log('list', seeders);
        process.exit(1);
      }
    });
  program
    .requiredOption('-c, --config <path>', 'path to your config file')
    .command('run')
    .action(async () => {
      console.log('options', program.opts());
      if (program.opts().config) {
        const nestjsTypeORMSeed = new NestJSTypeORMSeed(program.opts().config);
        await nestjsTypeORMSeed.init();
        await nestjsTypeORMSeed.run();
        process.exit(1);
      }
    });
  program.parse();
})();
