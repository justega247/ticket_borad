import { Router } from "express";
import { TicketController } from "../controller/TicketController";
import Authenticate from "../middleware/authenticate";

const router = Router();

router.post("/", Authenticate.authenticateUser, TicketController.newTicket);
router.put("/:id/assign", Authenticate.authenticateUser, TicketController.assignTicket);
router.put("/:id/manage", Authenticate.authenticateUser, TicketController.manageAssignedTicket);
router.get("/admin", Authenticate.authenticateUser, TicketController.retrieveAssignedTickets)

export default router;
