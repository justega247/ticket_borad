import { getRepository } from "typeorm";
import { Request, Response } from "express";
import { Ticket, TicketStatus } from "../entity/Ticket";
import { validate } from "class-validator";
import { validTypes, validAssignee, validComplexity, validAdmins } from "../utils/helper"

export class TicketController {
  static newTicket = async (req: Request, res: Response) => {
    const ticketRepository = getRepository(Ticket);

    const userId = res.locals.user.userId;

    let { summary, description, type, complexity, estimatedTime, assignee } = req.body;

    if (type && !validTypes.includes(type)) {
      res.status(400).json({
        status: 'failed',
        message: 'The type you have entered is invalid'
      });
      return;
    }

    if (complexity && !validComplexity.includes(complexity)) {
      res.status(400).json({
        status: 'failed',
        message: 'The ticket complexity you have entered is invalid'
      });
      return;
    }

    if (assignee && !validAssignee.includes(assignee)) {
      res.status(400).json({
        status: 'failed',
        message: 'The assignee you entered is invalid'
      });
      return;
    }

    let ticket = new Ticket();

    ticket.summary = summary;
    ticket.description = description;
    ticket.status = TicketStatus.PENDING;
    ticket.estimatedTime = estimatedTime;
    if (type) {
      ticket.type = type;
    };
    if (complexity){
      ticket.complexity = complexity;
    };
    if (assignee) {
      ticket.assignee = assignee;
    };

    let ticketData = {
      ...ticket,
      user: userId
    }

    const errors = await validate(ticket);
    if (errors.length > 0) {
      res.status(400).json({
        message: 'An error occured',
        errors
      });
      return;
    }

    let createdTicket: Ticket;

    try {
      createdTicket = await ticketRepository.save(ticketData)
    } catch {
      res.status(400).json({
        status: 'failed',
        message: 'Sorry new ticket could not be created, check your details and retry',
      });
      return;
    }
    res.status(201).json({
      status: 'success',
      message: 'New ticket created',
      ticket: createdTicket
    }); 
  };

  static assignTicket = async (req: Request, res: Response) => {
    const ticketId = Number(req.params.id)

    if (Number.isNaN(ticketId)) {
      return res.status(400).json({
        status: "failed",
        message: 'The id provided is invalid',
      });
    }

    const { assignee } = req.body;

    if (assignee && !validAdmins.includes(assignee)) {
      res.status(400).json({
        status: 'failed',
        message: 'The assignee you entered is invalid'
      });
      return;
    }

    const ticketRepository = getRepository(Ticket);

    const userId = res.locals.user.userId;

    try {
      let ticketFound: Ticket;
      ticketFound = await ticketRepository.findOneOrFail({
        where: {
          id: ticketId,
          user: {
            id: userId
          }
        }
      });

      ticketFound.assignee = assignee;

      await ticketRepository.save(ticketFound)

      const updatedTicket: Ticket = await ticketRepository.findOne(ticketId)

      return res.status(200).json({
        status: "success",
        ticket: updatedTicket
      })

    } catch(error) {
      res.status(400).json({
        status: "failed",
        message: "You cannot assign this story",
      });
      return;
    }
  };

  static retrieveAssignedTickets = async (req: Request, res: Response) => {
    const { role, username } = res.locals.user;

    if (role !== 'admin') {
      return res.status(403).json({
        status: "failed",
        message: 'Sorry, you are not allowed access to this route',
      });
    }

    const ticketRepository = getRepository(Ticket);

    let ticketsFound: Ticket[];

    try {
      ticketsFound = await ticketRepository.find({
        where: {
          assignee: username
        }
      });

      return res.status(200).json({
        status: "success",
        tickets: ticketsFound
      })

    } catch(error) {
      return res.status(400).json({
        status: "failed",
        message: "An error occured while getting the stories",
      });
    }
  };
}