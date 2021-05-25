import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config()

const { SECRET } = process.env;

export const adminToken = jwt.sign({ userId: 1, username: 'adminOne', role: 'admin' }, SECRET, {
  expiresIn: '1d',
});

export const adminToken2 = jwt.sign({ userId: 2, username: 'adminTwo', role: 'admin' }, SECRET, {
  expiresIn: '1d',
});

export const userToken = jwt.sign({ userId: 3, username: 'elNinoperezop', role: 'user' }, SECRET, {
  expiresIn: '1d',
});

export const secondUserToken = jwt.sign({ userId: 2, username: 'elNino', role: 'user' }, SECRET, {
  expiresIn: '1d',
});

export const invalidUserToken = jwt.sign({ userId: 111, username: 'elToro', role: 'user' }, SECRET, {
  expiresIn: '1d',
});
