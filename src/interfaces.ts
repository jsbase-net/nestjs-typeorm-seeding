export interface INestJSTypeORMSeed {}

export interface ISeeder {
  run(): Promise<any>;
}
