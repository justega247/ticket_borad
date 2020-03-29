import { expect } from 'chai';
import { describe, it } from 'mocha';
import request from 'supertest';
import { config }from 'dotenv';
import bcrypt from "bcryptjs";
import { createConnection, Connection } from 'typeorm';
import app from '../index';


config()

const {
  HOST,
  USERNAME,
  PASSWORD,
  DATABASE,
  ADMINPASSWORD
} = process.env

describe('Running auth tests', () => {
  let connection: Connection;
  before(async () => {
    connection = await createConnection({
      type: 'postgres',
      host: HOST,
      port: 5432,
      username: USERNAME,
      password: PASSWORD,
      database: DATABASE,
      synchronize: true,
      entities: ['src/entity/**/*.ts'],
    });

    const hashedPassword = bcrypt.hashSync(ADMINPASSWORD, 8)

    await connection.manager.save(
      connection.manager.create('User', {
        username: 'johnsmith',
        password: hashedPassword,
        role: 'admin',
      })
    );

    await connection.manager.save(
      connection.manager.create('User', {
        username: 'johnnydrille',
        password: hashedPassword,
        role: 'admin',
      })
    );
  });
  after(async () => {
    await connection.close();
  });

  describe('Post /auth/signup', () => {
    it('should create a user and return a token', (done) => {
      request(app)
        .post('/auth/signup')
        .send({
          username: 'elNinoperezop',
          password: 'password',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).to.equal('New user created successfully');
          expect(res.body.user).to.have.any.keys('token');
        })
        .end(done);
    });

    it('should not sign up a new user with an existing username', (done) => {
      request(app)
        .post('/auth/signup')
        .send({
          username: 'elNinoperezop',
          password: 'password',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.status).to.equal('failed');
          expect(res.body.message).to.equal('The username already exists');
          expect(res.body.user).to.be.undefined;
        })
        .end(done);
    });

    it('should not sign up a new user with an invalid role', (done) => {
      request(app)
        .post('/auth/signup')
        .send({
          username: 'elNino',
          password: 'password',
          role: 'not valid'
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.status).to.equal('failed');
          expect(res.body.message).to.equal('The role you have entered is invalid');
          expect(res.body.user).to.be.undefined;
        })
        .end(done);
    });
  });

  describe('Post /auth/login', () => {
    it('should login a user and return a token when valid credential is provided', (done) => {
      request(app)
        .post('/auth/login')
        .send({
          username: 'elNinoperezop',
          password: 'password',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).to.equal('Login successful');
          expect(res.body.user).to.have.any.keys('token');
        })
        .end(done);
    });

    it('should not login user with an invalid username', (done) => {
      request(app)
        .post('/auth/login')
        .send({
          username: 'elNinoperezo',
          password: 'password',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.status).to.equal('failed');
          expect(res.body.message).to.equal('The username does not exists');
          expect(res.body.user).to.be.undefined;
        })
        .end(done);
    });

    it('should not login user with an invalid password', (done) => {
      request(app)
        .post('/auth/login')
        .send({
          username: 'elNinoperezop',
          password: 'passworded'
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.status).to.equal('failed');
          expect(res.body.message).to.equal('The password you have provided is incorrect');
          expect(res.body.user).to.be.undefined;
        })
        .end(done);
    });
  });
});