import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Departments } from '../../../modules/departments/entities/department.entity';
import { Projects } from '../../../modules/projects/entities/projects.entity';

export enum Role {
  Admin = 'Admin',
  Manager = 'Manager',
  Employee = 'Employee',
}

@Entity()
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.Employee,
  })
  role: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToMany(() => Projects, (project) => project.employees)
  projects: Projects[];

  @ManyToOne(() => Departments, (department) => department.employee)
  department: Departments | null;

  @Column({ nullable: true })
  departmentId: string | null; // store FK in DB
}
