import { Router } from "express";
import { AuthController } from "../controller/AuthController";

const router = Router();

router.post("/signup", AuthController.newUser);
router.post("/login", AuthController.login);

export default router;

