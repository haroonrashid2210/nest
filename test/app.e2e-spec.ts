import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { connect, Connection } from 'mongoose';

describe('e2e Testing', () => {
  let app: INestApplication;

  let mongoConnection: Connection;
  let token1 = '';
  let token2 = '';
  let accountNumber1 = '';
  let accountNumber2 = '';

  beforeAll(async () => {
    mongoConnection = (
      await connect(
        `mongodb+srv://${'haroonrashid2210'}:${'G7Tk3!s92By4teq'}@cluster0.5wlav.mongodb.net/${'testdb'}?retryWrites=true&w=majority`,
      )
    ).connection;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await app.close();
  });

  describe('Auth', () => {
    // SIGNUP ###############################################

    describe('Signup', () => {
      it('should not signup with "cnic" = ""', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            name: 'Haroon',
            cnic: '',
            password: 'Password@123',
          });

        expect(response.statusCode).toEqual(400);
      });

      it('should not signup with "cnic.length" > 13', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            name: 'Haroon',
            cnic: '37405000000000',
            password: 'Password@123',
          });

        expect(response.statusCode).toEqual(400);
      });

      it('should not signup with "cnic.length" < 13', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            name: 'Haroon',
            cnic: '374050000000',
            password: 'Password@123',
          });

        expect(response.statusCode).toEqual(400);
      });

      it('should not signup with "cnic" including Alphabets', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            name: 'Haroon',
            cnic: '374050000000A',
            password: 'Password@123',
          });

        expect(response.statusCode).toEqual(400);
      });

      it('should not signup with "cnic" including Special characters', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            name: 'Haroon',
            cnic: '374050000000$',
            password: 'Password@123',
          });

        expect(response.statusCode).toEqual(400);
      });

      it('should not signup with "cnic" including Spaces', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            name: 'Haroon',
            cnic: '374050000000 ',
            password: 'Password@123',
          });

        expect(response.statusCode).toEqual(400);
      });

      it('should not signup with "name" = ""', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            name: '',
            cnic: '3740500000000',
            password: 'Password@123',
          });

        expect(response.statusCode).toEqual(400);
      });

      it('should not signup with "password" = ""', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            name: 'Haroon',
            cnic: '3740500000000',
            password: '',
          });

        expect(response.statusCode).toEqual(400);
      });

      it('should signup with with correct data', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            name: 'Haroon',
            cnic: '3740500000000',
            password: 'Password@123',
          });

        await request(app.getHttpServer()).post('/auth/signup').send({
          name: 'Hamza',
          cnic: '3740500000001',
          password: 'Password@123',
        });

        expect(response.statusCode).toEqual(201);
      });
    });

    // Signin ###############################################

    describe('Signin', () => {
      it('should not signin with invalid user', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            cnic: '0000000000000',
            password: 'Password@123',
          });

        expect(response.statusCode).toEqual(404);
      });

      it('should not signin with invalid password', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            cnic: '3740500000000',
            password: 'Password',
          });

        expect(response.statusCode).toEqual(403);
      });

      it('should signin with correct data', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            cnic: '3740500000000',
            password: 'Password@123',
          });

        expect(response.statusCode).toEqual(201);
        expect(response.body.data?.sessionToken).toBeDefined();

        token1 = response.body.data?.sessionToken;

        const response2 = await request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            cnic: '3740500000001',
            password: 'Password@123',
          });

        token2 = response2.body.data?.sessionToken;
      });

      it('should get me', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/accounts')
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(200);
      });
    });
  });

  // Accounts ###############################################

  describe('Accounts', () => {
    // Create ###############################################

    describe('Create', () => {
      it('should not be able to create account with "initialDepositAmount" < 1', async () => {
        const response = await request(app.getHttpServer())
          .post('/accounts/create')
          .send({ initialDepositAmount: 0 })
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(400);
      });

      it('should be able to create account with correct data', async () => {
        const response = await request(app.getHttpServer())
          .post('/accounts/create')
          .send({ initialDepositAmount: 100 })
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(201);
        accountNumber1 = response.body.data.accountNumber;

        const response2 = await request(app.getHttpServer())
          .post('/accounts/create')
          .send({ initialDepositAmount: 100 })
          .auth(token2, { type: 'bearer' });
        accountNumber2 = response2.body.data.accountNumber;
      });
    });

    // Deposits ###############################################

    describe('Deposit', () => {
      it('should not be able to deposit amount with invalid "accountNumber"', async () => {
        const response = await request(app.getHttpServer())
          .put('/accounts/deposit-amount')
          .send({ accountNumber: '3740500000009', amount: 100 })
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(400);
      });

      it('should not be able to deposit amount with invalid "amount"', async () => {
        const response = await request(app.getHttpServer())
          .put('/accounts/deposit-amount')
          .send({ accountNumber: accountNumber1, amount: 0 })
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(400);
      });

      it('should be able to deposit amount with correct data', async () => {
        const response = await request(app.getHttpServer())
          .put('/accounts/deposit-amount')
          .send({ accountNumber: accountNumber1, amount: 100 })
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(200);
        expect(response.body.data?.balance).toBe(200);
      });
    });

    // Withdraw ###############################################

    describe('Withdraw', () => {
      it('should not be able to withdraw amount with invalid "accountNumber"', async () => {
        const response = await request(app.getHttpServer())
          .put('/accounts/withdraw-amount')
          .send({ accountNumber: '3740500000009', amount: 100 })
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(400);
      });

      it('should not be able to withdraw amount with invalid "amount"', async () => {
        const response = await request(app.getHttpServer())
          .put('/accounts/withdraw-amount')
          .send({ accountNumber: accountNumber1, amount: 0 })
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(400);
      });

      it('should not be able to withdraw amount with "amount" > balance', async () => {
        const response = await request(app.getHttpServer())
          .put('/accounts/withdraw-amount')
          .send({ accountNumber: accountNumber1, amount: 300 })
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(400);
      });

      it('should be able to withdraw amount with correct data', async () => {
        const response = await request(app.getHttpServer())
          .put('/accounts/withdraw-amount')
          .send({ accountNumber: accountNumber1, amount: 100 })
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(200);
        expect(response.body.data?.balance).toBe(100);
      });
    });

    // Transfer ###############################################

    describe('Transfer Amount', () => {
      it('should not be able to transfer amount with invalid "accountNumber"', async () => {
        const response = await request(app.getHttpServer())
          .put('/accounts/transfer-amount')
          .send({
            accountNumber: '0000000000000',
            receiverAccountNumber: accountNumber2,
            amount: 100,
          })
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(400);
      });

      it('should not be able to transfer amount with invalid "receiverAccountNumber"', async () => {
        const response = await request(app.getHttpServer())
          .put('/accounts/transfer-amount')
          .send({
            accountNumber: accountNumber1,
            receiverAccountNumber: '0000000000000',
            amount: 100,
          })
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(400);
      });

      it('should not be able to transfer amount with invalid "amount"', async () => {
        const response = await request(app.getHttpServer())
          .put('/accounts/transfer-amount')
          .send({
            accountNumber: accountNumber1,
            receiverAccountNumber: accountNumber2,
            amount: 0,
          })
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(400);
      });

      it('should not be able to transfer "amount" > balance', async () => {
        const response = await request(app.getHttpServer())
          .put('/accounts/transfer-amount')
          .send({
            accountNumber: accountNumber1,
            receiverAccountNumber: accountNumber2,
            amount: 200,
          })
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(400);
      });

      it('should not be able to transfer amount on same account', async () => {
        const response = await request(app.getHttpServer())
          .put('/accounts/transfer-amount')
          .send({
            accountNumber: accountNumber1,
            receiverAccountNumber: accountNumber1,
            amount: 100,
          })
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(400);
      });

      it('should be able to transfer amount with correct data', async () => {
        const response = await request(app.getHttpServer())
          .put('/accounts/transfer-amount')
          .send({
            accountNumber: accountNumber1,
            receiverAccountNumber: accountNumber2,
            amount: 50,
          })
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(200);
        expect(response.body.data?.balance).toBe(50);
      });
    });

    // History ###############################################

    describe('History', () => {
      it('should get the correct history', async () => {
        const response = await request(app.getHttpServer())
          .get('/accounts/transfer-history')
          .query({ accountNumber: accountNumber1 })
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.history).toBeDefined();
        expect(response.body.data.history.length).toBeDefined();
        expect(response.body.data.history.length).toBe(4);

        expect(response.body.data.history[0].type).toBe(1);
        expect(response.body.data.history[1].type).toBe(1);
        expect(response.body.data.history[2].type).toBe(2);
        expect(response.body.data.history[3].type).toBe(3);

        const response2 = await request(app.getHttpServer())
          .get('/accounts/transfer-history')
          .query({ accountNumber: accountNumber2 })
          .auth(token2, { type: 'bearer' });

        expect(response2.statusCode).toBe(200);
        expect(response2.body.data).toBeDefined();
        expect(response2.body.data.history).toBeDefined();
        expect(response2.body.data.history.length).toBeDefined();
        expect(response2.body.data.history.length).toBe(2);

        expect(response2.body.data.history[0].type).toBe(1);
        expect(response2.body.data.history[1].type).toBe(4);
      });
    });
  });

  // Users ###############################################

  describe('Users', () => {
    describe('Accounts', () => {
      it('should get all user accounts', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/accounts')
          .auth(token1, { type: 'bearer' });

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.accounts).toBeDefined();
        expect(response.body.data.accounts.length).toBeDefined();
        expect(response.body.data.accounts.length).toBe(1);

        expect(response.body.data.accounts[0].accountNumber).toBeDefined();
        expect(response.body.data.accounts[0].accountNumber).toBe(
          accountNumber1,
        );

        const response2 = await request(app.getHttpServer())
          .get('/users/accounts')
          .auth(token2, { type: 'bearer' });

        expect(response2.statusCode).toBe(200);
        expect(response2.body.data).toBeDefined();
        expect(response2.body.data.accounts).toBeDefined();
        expect(response2.body.data.accounts.length).toBeDefined();
        expect(response2.body.data.accounts.length).toBe(1);

        expect(response2.body.data.accounts[0].accountNumber).toBeDefined();
        expect(response2.body.data.accounts[0].accountNumber).toBe(
          accountNumber2,
        );
      });
    });
  });
});
