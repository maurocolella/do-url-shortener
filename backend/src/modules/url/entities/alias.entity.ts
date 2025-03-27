import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { CanonicalUrlEntity } from './canonical-url.entity';

@Entity('aliases')
export class AliasEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  alias: string;

  @Column({ default: 0 })
  visits: number;

  @ManyToOne(() => UserEntity, user => user.aliases, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => CanonicalUrlEntity, canonicalUrl => canonicalUrl.aliases, { nullable: false })
  @JoinColumn({ name: 'canonicalUrlId' })
  canonicalUrl: CanonicalUrlEntity;

  @Column()
  canonicalUrlId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
