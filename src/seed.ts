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
        const seeders = await nestjsTypeORMSeed.list();
        let output = '';
        seeders.map((s, index) => {
          const indexNumber = index + 1;
          output += `${indexNumber}. ${s.isCompleted ? '[x]' : '[ ]'} ${s.name}`;
        });
        console.log(output);
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

  program
    .requiredOption('-c, --config <path>', 'path to your config file')
    .requiredOption('-d, --dir <path>', 'path to your seeds directory')
    .command('generate <seederName>')
    .action(async (seederName: string) => {
      console.log('options', program.opts());
      if (program.opts().config) {
        const nestjsTypeORMSeed = new NestJSTypeORMSeed(program.opts().config);
        await nestjsTypeORMSeed.init();
        await nestjsTypeORMSeed.generateSeeder(
          seederName,
          program.opts().dir || '',
        );
        process.exit(1);
      }
    });
  program.parse();
})();
