import "reflect-metadata";
import {createConnection} from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import {config}from 'dotenv';
import * as bcrypt from "bcryptjs";
import routes from "./routes";
import { User } from "./entity/User";

config()

const {
    ADMINPASSWORD
} = process.env

createConnection().then(async connection => {
    // create express app
    const app: express.Application = express();

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

    console.log("Express server has started on port 3000. Open http://localhost:3000/users to see results");

}).catch(error => console.log(error));
