import { expect } from 'chai';
import { describe, it } from 'mocha';
import request from 'supertest';
import { createConnection, Connection } from 'typeorm';
import { userToken, invalidUserToken } from './testMock';
import app from '../index';

describe('Running tickets tests', () => {
  let connection: Connection;
  before(async () => {
    connection = await createConnection("test");
  });
  after(async () => {
    await connection.close();
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
      return done();
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
      return done();
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
      return done();
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
      return done();
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
      return done();
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
      return done();
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
      return done();
      });
  });
});