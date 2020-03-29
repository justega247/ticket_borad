import { getRepository } from "typeorm";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config }from 'dotenv';
import { User } from "../entity/User";
import { validate } from "class-validator";
import { validRoles } from "../utils/helper"

config()

const {
  SECRET,
  EXPIRES
} = process.env

export class AuthController {
  static newUser = async (req: Request, res: Response) => {
    const userRepository = getRepository(User);
    
    //Get parameters from the body
    let { username, password, role } = req.body;

    let existingUsername = await userRepository.findOne({ username });

    if (existingUsername) {
      res.status(400).json({
        status: 'failed',
        message: "The username already exists"
      });
      return;
    }

    if (role && !validRoles.includes(role)) {
      res.status(400).json({
        status: 'failed',
        message: "The role you have entered is invalid"
      });
      return;
    }

    let user = new User();
    user.username = username;
    user.password = password;
    user.role = role;

    //Validade if the parameters are ok
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).json({
        message: 'An error occured',
        errors
      });
      return;
    }

    //Hash the password, to securely store on DB
    user.hashPassword();

    let createdUser;
    try {
      createdUser = await userRepository.save(user);
    } catch (error) {
      res.status(400).json({
        message: 'An error occured',
        error
      });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      SECRET,
      { expiresIn: EXPIRES }
    );

    const { password: userPassword, ...userDetails } = createdUser

    //If all ok, send 201 response
    res.status(201).json({
      status: 'success',
      message: 'New user created successfully',
      user: {
        ...userDetails,
        token
      }
    })
  };

  static login = async (req: Request, res: Response) => {
    //Check if username and password are set
    let { username, password } = req.body;
    if (!(username && password)) {
      res.status(400).json({
        status: 'failed',
        message: 'Please provide complete login credentials'
      });
    }

    //Get user from database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { username } });
    } catch (error) {
      res.status(400).json({
        status: 'failed',
        message: "The username does not exists"
      });
      return;
    }

    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      res.status(400).json({
        status: 'failed',
        message: "The password you have provided is incorrect"
      });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      SECRET,
      { expiresIn: EXPIRES }
    );

    const { password: userPassword, tickets, ...userDetails } = user

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      user: {
        ...userDetails,
        token
      }
    })
  };
}
