import { Router } from "express";
import auth from "./auth";
import ticket from "./ticket";

const routes = Router();

routes.use("/auth", auth);
routes.use("/ticket", ticket);

export default routes;
