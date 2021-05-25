import "reflect-metadata";
import {createConnection} from "typeorm";
import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import { config }from 'dotenv';
import bcrypt from "bcryptjs";
import routes from "./routes";
import { User } from "./entity/User";

config()

const {
    ADMINPASSWORD
} = process.env

const app: express.Application = express();

createConnection().then(async connection => {

    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());

    app.use("/", routes);

    app.listen(3000);

    let userRepository = connection.getRepository(User);
    let adminUser: User = await userRepository.findOne({ username: "adminOne", });

    let hashedPassword = bcrypt.hashSync(ADMINPASSWORD, 8)

    if (!adminUser) {
        await connection.manager.save(connection.manager.create('User', {
            username: "adminOne",
            password: hashedPassword,
            role: "admin"
        }));
        await connection.manager.save(connection.manager.create('User', {
            username: "adminTwo",
            password: hashedPassword,
            role: "admin"
        }));
    }
    

    console.log("Express server has started on port 3000.");

}).catch(error => console.log(error));

export default app;
