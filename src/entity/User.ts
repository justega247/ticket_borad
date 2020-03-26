import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from "typeorm";
import { Ticket } from './Ticket';
import { Length, IsNotEmpty } from "class-validator";
import * as bcrypt from "bcryptjs";

export enum UserRoleType {
  ADMIN ='admin',
  USER='user'
};
  
@Entity()
@Unique(["username"])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Length(4, 20)
  username: string;

  @Column()
  @Length(4, 100)
  password: string;

  @Column({
    type: 'enum',
    enum: UserRoleType,
    default: 'user',
  })
  role: UserRoleType;

  @OneToMany(
    () => Ticket, 
    ticket => ticket.user, 
    { eager: true, cascade: true }
  )
  tickets: Ticket[]


  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}