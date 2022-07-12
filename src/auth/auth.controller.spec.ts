import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { SignupStub } from '../../test/stubs';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../models/user.model';
import { AuthService } from './auth.service';

describe('AppController', () => {
  let authController: AuthController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let UserModel: Model<User>;

  const mockService = {
    signup: jest.fn((dto) => dto),
  };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    UserModel = mongoConnection.model(User.name, UserSchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: UserModel },
      ],
    })
      .overrideProvider(AuthService)
      .useValue(mockService)
      .compile();
    authController = app.get<AuthController>(AuthController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('postArticle', () => {
    it('should return the saved object', async () => {
      const createdArticle = await authController.signup(SignupStub());
      console.log(createdArticle, '/////////////');

      expect(createdArticle.success).toBe(1);
    });
    // it('should return ArticleAlreadyExists (Bad Request - 400) exception', async () => {
    //   await new UserModel(ArticleDTOStub()).save();
    //   await expect(
    //     authController.postArticle(ArticleDTOStub()),
    //   ).rejects.toThrow(ArticleAlreadyExists);
    // });
  });
});
