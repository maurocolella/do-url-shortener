import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AliasEntity } from './alias.entity';

@Entity('canonical_urls')
export class CanonicalUrlEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  canonicalUrl: string;

  @OneToMany(() => AliasEntity, alias => alias.canonicalUrl)
  aliases: AliasEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
