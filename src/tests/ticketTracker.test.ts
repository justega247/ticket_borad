import { expect } from 'chai';
import { describe, it } from 'mocha';
import request from 'supertest';
import { config }from 'dotenv';
import bcrypt from "bcryptjs";
import { createConnection, Connection } from 'typeorm';
import { adminToken, adminToken2, userToken, secondUserToken, invalidUserToken } from './testMock';
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
        username: 'adminOne',
        password: hashedPassword,
        role: 'admin',
      })
    );

    await connection.manager.save(
      connection.manager.create('User', {
        username: 'adminTwo',
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

  describe('Post /ticket', () => {
    it('should create a new ticket when valid details are provided', (done) => {
      const ticketDetails = {
        summary: "This is a ticket",
        description: "What is life here",
        estimatedTime: "today",
        type: "bug"
      }
      
      request(app)
        .post('/ticket')
        .set('authorization', userToken)
        .send(ticketDetails)
        .expect(201)
        .expect((res) => {
          expect(res.body.status).to.equal('success') 
          expect(res.body.message).to.equal('New ticket created');
          expect(res.body).to.have.any.keys('ticket');
          expect(res.body.ticket).to.have.any.keys('summary');
          expect(res.body.ticket).to.have.any.keys('description');
          expect(res.body.ticket).to.have.any.keys('complexity');
          expect(res.body.ticket).to.have.any.keys('type');
          expect(res.body.ticket).to.have.any.keys('user');
          expect(res.body.ticket).to.have.any.keys('estimatedTime');
        })
        .end(done);
    });

    it('should not create a new ticket when no token is provided', (done) => {
      const ticketDetails = {
        summary: "This is a ticket",
        description: "What is life here",
        estimatedTime: "today",
        type: "bug"
      }

      request(app)
        .post('/ticket')
        .send(ticketDetails)
        .expect(400)
        .expect((res) => {
          expect(res.body.status).to.equal('failed');
          expect(res.body.message).to.equal('Please add your token');
        })
        .end(done);
      });
    
    it('should not create a new ticket when a token for a non existent user is provided', (done) => {
      const ticketDetails = {
        summary: "This is a ticket",
        description: "What is life here",
        estimatedTime: "today",
        type: "bug"
      }

      request(app)
        .post('/ticket')
        .set('authorization', invalidUserToken)
        .send(ticketDetails)
        .expect(404)
        .expect((res) => {
          expect(res.body.status).to.equal('failed');
          expect(res.body.message).to.equal('Sorry, no user with a matching id was found');
        })
        .end(done);
      });

    it('should not create a new ticket when an invalid token is provided', (done) => {
      const ticketDetails = {
        summary: "This is a ticket",
        description: "What is life here",
        estimatedTime: "today",
        type: "bug"
      }

      request(app)
        .post('/ticket')
        .set('authorization', `${userToken}s`)
        .send(ticketDetails)
        .expect(401)
        .expect((res) => {
          expect(res.body.status).to.equal('failed');
          expect(res.body.message).to.equal('Invalid token provided');
        })
        .end(done);
      });

    it('should not create a new ticket when an invalid type value is provided', (done) => {
      const ticketDetails = {
        summary: "This is a ticket",
        description: "What is life here",
        estimatedTime: "today",
        type: "buggy"
      }

      request(app)
        .post('/ticket')
        .set('authorization', userToken)
        .send(ticketDetails)
        .expect(400)
        .expect((res) => {
          expect(res.body.status).to.equal('failed');
          expect(res.body.message).to.equal('The type you have entered is invalid');
        })
        .end(done);
      });

    it('should not create a new ticket when an invalid complexity value is provided', (done) => {
      const ticketDetails = {
        summary: "This is a ticket",
        description: "What is life here",
        estimatedTime: "today",
        type: "bug",
        complexity: 4
      }

      request(app)
        .post('/ticket')
        .set('authorization', userToken)
        .send(ticketDetails)
        .expect(400)
        .expect((res) => {
          expect(res.body.status).to.equal('failed');
          expect(res.body.message).to.equal('The ticket complexity you have entered is invalid');
        })
        .end(done);
      });

    it('should not create a new ticket when an invalid assignee value is provided', (done) => {
      const ticketDetails = {
        summary: "This is a ticket",
        description: "What is life here",
        estimatedTime: "today",
        type: "bug",
        assignee: "me"
      }

      request(app)
        .post('/ticket')
        .set('authorization', userToken)
        .send(ticketDetails)
        .expect(400)
        .expect((res) => {
          expect(res.body.status).to.equal('failed');
          expect(res.body.message).to.equal('The assignee you entered is invalid');
        })
        .end(done);
      });
  });

  describe('Put /ticket/:id/assign', () => {
    it('should assign a ticket when valid details are provided', (done) => {
      const assigneeDetails = {
        assignee: "adminOne"
      }

      request(app)
        .put('/ticket/1/assign')
        .set('authorization', userToken)
        .send(assigneeDetails)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.ticket.assignee).to.equal(assigneeDetails.assignee);
        })
        .end(done)
      });

    it('should not assign a ticket created by a different user', (done) => {
      const assigneeDetails = {
        assignee: "adminOne"
      }

      request(app)
        .put('/ticket/1/assign')
        .set('authorization', secondUserToken)
        .send(assigneeDetails)
        .expect(400)
        .expect((res) => {
          expect(res.body.status).to.equal('failed');
          expect(res.body.message).to.equal('You cannot assign this story');
        })
        .end(done)
      });

    it('should not assign a ticket when an invalid assignee is provided', (done) => {
      const assigneeDetails = {
        assignee: "fakeAdmin"
      }

      request(app)
        .put('/ticket/1/assign')
        .set('authorization', userToken)
        .send(assigneeDetails)
        .expect(400)
        .expect((res) => {
          expect(res.body.status).to.equal('failed');
          expect(res.body.message).to.equal('The assignee you entered is invalid');
        })
        .end(done)
      });
  });

  describe('Post /ticket/admin', () => {
    it('should retrieve all the tickets assigned to an admin', (done) => {
      request(app)
        .get('/ticket/admin')
        .set('authorization', adminToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.tickets).to.have.lengthOf(1)
        })
        .end(done)
      });

    it('should not retrieve all tickets when an ordinary user accesses the route', (done) => {
      request(app)
        .get('/ticket/admin')
        .set('authorization', userToken)
        .expect(403)
        .expect((res) => {
          expect(res.body.status).to.equal('failed');
          expect(res.body.message).to.equal('Sorry, you are not allowed access to this route')
        })
        .end(done)
      });
  });

  describe('Post /ticket/:id/manage?action={action}', () => {
    it('should set the status of a ticket to approved when valid details are provided' , (done) => {
      const action = 'approve'
      const id = 1;

      request(app)
        .put(`/ticket/${id}/manage?action=${action}`)
        .set('authorization', adminToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).to.equal('success');
          expect(res.body.ticket.status).to.equal('approved')
        })
        .end(done)
    });

    it('should not set the status of a ticket when invalid action is provided' , (done) => {
      const action = 'approval'
      const id = 1;

      request(app)
        .put(`/ticket/${id}/manage?action=${action}`)
        .set('authorization', adminToken)
        .expect(400)
        .expect((res) => {
          expect(res.body.status).to.equal('failed');
          expect(res.body.message).to.equal('Please provide a valid action')
        })
        .end(done)
    });

    it('should not set the status of a ticket when invalid id is provided' , (done) => {
      const action = 'approval'
      const id = 'pop';

      request(app)
        .put(`/ticket/${id}/manage?action=${action}`)
        .set('authorization', adminToken)
        .expect(400)
        .expect((res) => {
          expect(res.body.status).to.equal('failed');
          expect(res.body.message).to.equal('The id provided is invalid')
        })
        .end(done)
    });

    it('should not allow an ordinary user manage a ticket' , (done) => {
      const action = 'approve'
      const id = 1;

      request(app)
        .put(`/ticket/${id}/manage?action=${action}`)
        .set('authorization', userToken)
        .expect(403)
        .expect((res) => {
          expect(res.body.status).to.equal('failed');
          expect(res.body.message).to.equal('Sorry, you are not allowed access to this route')
        })
        .end(done)
    });

    it('should not set the status of a ticket assigned to a different admin' , (done) => {
      const action = 'approve'
      const id = 1;

      request(app)
        .put(`/ticket/${id}/manage?action=${action}`)
        .set('authorization', adminToken2)
        .expect(400)
        .expect((res) => {
          expect(res.body.status).to.equal('failed');
          expect(res.body.message).to.equal('You cannot manage this story')
        })
        .end(done)
    });
  })
});