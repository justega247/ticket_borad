export enum TicketStatus {
  APPROVED='approved',
  REJECTED='rejected',
  PENDING='pending'
};

export enum AdminAssigned {
  ADMINONE='adminOne',
  ADMINTWO='adminTwo',
  UNASSIGNED='unassigned'
};

export enum TicketType {
  BUGFIX='bug',
  CHORE='chore',
  FEATURE='feature'
};

export type Complexity = 0 | 1 | 2 | 3;

export type CreateTicket = {
  summary: string;
	description: string;
	estimatedTime: string;
	type?: TicketType;
	complexity?: Complexity;
	assignee?: AdminAssigned;
};

export enum UserRoleType {
  ADMIN ='admin',
  USER='user'
};

export type Login = {
  username: string;
  password: string;
};

export interface ICreateUser extends Login {
  role?: UserRoleType;
};
