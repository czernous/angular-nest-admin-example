import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from './models/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn().mockResolvedValue(User),
            find: jest.fn().mockResolvedValue([User]),
          },
        },
      ],
      controllers: [UserController],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('* Find All Users', () => {
    it('should return an array of users', async () => {
      const user = new User();
      const result = [user];
      jest
        .spyOn(userService, 'getAll')
        .mockImplementation(async () => await result);

      expect(await userController.getAllUsers()).toBe(result);
    });
  });
});
