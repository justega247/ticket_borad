import { TicketStatus, AdminAssigned, TicketType, UserRoleType } from "../common/types";

export const validRoles = [UserRoleType.ADMIN, UserRoleType.USER];
export const validTypes = [TicketType.BUGFIX, TicketType.CHORE, TicketType.FEATURE];
export const validAssignee = [AdminAssigned.ADMINONE, AdminAssigned.ADMINTWO, AdminAssigned.UNASSIGNED];
export const validAdmins = [AdminAssigned.ADMINONE, AdminAssigned.ADMINTWO];
export const validComplexity = [0, 1, 2, 3];
export const manageTicket = {
  'approve': TicketStatus.APPROVED,
  'reject': TicketStatus.REJECTED
};
