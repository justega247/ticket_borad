import jwt from 'jsonwebtoken';

const { SECRET } = process.env;

export const userToken = jwt.sign({ userId: 3, username: 'elNinoperezop', role: 'user' }, SECRET, {
  expiresIn: '1d',
});

export const invalidUserToken = jwt.sign({ userId: 111, username: 'elToro', role: 'user' }, SECRET, {
  expiresIn: '1d',
});