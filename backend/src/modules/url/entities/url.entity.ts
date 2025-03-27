import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('urls')
export class UrlEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  originalUrl: string;

  @Column({ default: 0 })
  visits: number;

  @ManyToOne(() => UserEntity, user => user.urls, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Column({ nullable: true })
  userId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
