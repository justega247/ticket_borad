import { Router } from "express";
import { TicketController } from "../controller/TicketController";
import Authenticate from "../middleware/authenticate";

const router = Router();

router.post("/", Authenticate.authenticateUser, TicketController.newTicket);
router.post("/:id/assign", Authenticate.authenticateUser, TicketController.assignTicket);

export default router;
