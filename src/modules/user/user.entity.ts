import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// import { Chat } from '../chat/chat.entity';

@Entity()
export class User {
  /* ----------------------Structure---------------------- */

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column()
  phoneNumber: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  dob: Date;

  @Column({ default: 'Hindi' })
  language: string;

  @Column({ default: 'male' })
  gender: 'male' | 'female';

  // @OneToMany(() => Chat, (chat) => chat.sender)
  // senderChats: Chat[];

  // @OneToMany(() => Chat, (chat) => chat.recipient)
  // recipientChats: Chat[];

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Expose()
  accessToken?: string;

  /* ----------------------Relationships---------------------- */
}
