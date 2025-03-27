import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UrlEntity } from '../../url/entities/url.entity';
import { AliasEntity } from '../../url/entities/alias.entity';

export enum AuthProviderEnum {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({
    type: 'enum',
    enum: AuthProviderEnum,
    default: AuthProviderEnum.LOCAL,
  })
  provider: AuthProviderEnum;

  @Column({ nullable: true })
  @Exclude()
  googleId?: string;

  @OneToMany(() => UrlEntity, url => url.user)
  urls: UrlEntity[];

  @OneToMany(() => AliasEntity, alias => alias.user)
  aliases: AliasEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
