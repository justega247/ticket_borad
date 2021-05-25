import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { TicketStatus, TicketType, AdminAssigned, Complexity } from "../common/types";

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  summary: string;

  @Column("text")
  description: string;

  @Column({
    type: 'enum',
    enum: TicketType,
    default: TicketType.FEATURE
  })
  type: TicketType;

  @Column({
    type: "integer",
    default: 0
  })
  complexity: Complexity;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.PENDING
  })
  status: TicketStatus;

  @Column()
  estimatedTime: string;

  @Column({
    type: 'enum',
    enum: AdminAssigned,
    default: AdminAssigned.UNASSIGNED
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
