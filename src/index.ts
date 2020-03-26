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

// create express app
const app: express.Application = express();

createConnection().then(async connection => {

    // Call midlewares
    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());

    //Set all routes from routes folder
    app.use("/", routes);

    // start express server
    app.listen(3000);

    // check admins
    let userRepository = connection.getRepository(User);
    let adminUser = await userRepository.findOne({ username: "adminOne", });

    let hashedPassword = bcrypt.hashSync(ADMINPASSWORD, 8)

    // insert admin users for test
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
