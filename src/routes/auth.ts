import { Router } from "express";
import {AuthController} from "../controller/AuthController";

const router = Router();

router.post("/signup", AuthController.newUser);

export default router;
