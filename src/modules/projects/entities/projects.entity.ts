import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Employee } from '../../../modules/employee/entities/employee.entity';

export enum Status {
  Active = 'Active',
  Completed = 'Completed',
}

@Entity('projects')
export class Projects {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'longtext', nullable: true })
  description: string;

  // array of employees ids assigned to the project
  @Column('json', { nullable: true })
  assignedEmployeeIds: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToMany(() => Employee, (employee) => employee.projects)
  @JoinTable()
  employees: Employee[];

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
  })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  deadline?: Date | null;
}
