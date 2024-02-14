import { getDataSourceToken } from '@nestjs/typeorm';
import { Seeder } from '../seeder';
import { UserEntity } from 'src/example/user.entity';
import { UserRepository } from 'src/repositories/user-repository';
export default class ExampleSeeder extends Seeder {
  async run(): Promise<any> {
    const dataSource = this.appInstance.get(getDataSourceToken());
    const userRepository = dataSource.getRepository(UserEntity);
    const users: Partial<UserEntity>[] = [
      { firstName: 'Van A', lastName: 'Nguyen', isActive: true },
      { firstName: 'Thi B', lastName: 'Nguyen', isActive: true },
      { firstName: 'Thi C', lastName: 'Tran', isActive: false },
      { firstName: 'Van D', lastName: 'Dinh', isActive: false },
      { firstName: 'Minh E', lastName: 'Ly', isActive: true },
    ];
    await userRepository.save(users);
    const customUserRepository = this.appInstance.get(UserRepository);
    const anotherUsers: Partial<UserEntity>[] = [
      { firstName: 'Van F', lastName: 'Nguyen', isActive: true },
      { firstName: 'Thi G', lastName: 'Nguyen', isActive: true },
      { firstName: 'Thi H', lastName: 'Tran', isActive: false },
      { firstName: 'Van J', lastName: 'Dinh', isActive: false },
      { firstName: 'Minh K', lastName: 'Ly', isActive: true },
    ];
    await customUserRepository.save(anotherUsers);
    return;
  }
}
