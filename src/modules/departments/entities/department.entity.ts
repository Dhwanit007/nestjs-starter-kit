import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Employee } from '../../../modules/employee/entities/employee.entity';

@Entity('departments')
export class Departments {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  // Store assigned employee IDs as JSON (same as projects)
  // @Column('json', { nullable: true })
  // assignedEmployeeIds: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Employee, (employee) => employee.department)
  employee: Employee;
}
