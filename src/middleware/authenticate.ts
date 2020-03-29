import { User } from "../entity/User";
import { Request, Response, NextFunction } from "express";
import { verify } from 'jsonwebtoken';
import { getRepository } from "typeorm";

const {
  SECRET
} = process.env

class Authenticate {
  static authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      let userId;
      if (token) {
        verify(token, SECRET, (err, decoded) => {
          if (err) {
            return res.status(401).json({
              status: 'failed',
              message: 'Invalid token provided'
            })
          }
          res.locals.user = decoded;
          userId = res.locals.user.userId;
        });
      } else {
        return res.status(400).json({
          status: 'failed',
          message: 'Please add your token'
        });
      }
  
      let userRepository = getRepository(User);
      let loggedInUser: User = await userRepository.findOne({ id: userId });
  
      if (!loggedInUser) {
        return res.status(404).json({
          status: 'failed',
          message: 'Sorry, no user with a matching id was found'
        });
      }
      next();
    } catch(error) {
      return;
    }
  }
};

export default Authenticate;
