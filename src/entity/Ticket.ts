import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';

export enum TicketStatus {
  APPROVED='approved',
  REJECTED='rejected',
  PENDING='pending'
}

export enum AdminAssigned {
  ADMINONE='adminOne',
  ADMINTWO='adminTwo'
}

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  summary: string;

  @Column()
  description: string;

  @Column()
  type: string;

  @Column()
  complexity: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.PENDING,
  })
  status: TicketStatus;

  @Column()
  estimatedTime: string;

  @Column({
    type: 'enum',
    enum: AdminAssigned
  })
  assignee: AdminAssigned;

  @ManyToOne(
    () => User, 
    user  => user.tickets, 
  )
  user: User

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}