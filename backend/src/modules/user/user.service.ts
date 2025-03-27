import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, AuthProviderEnum } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { googleId } });
  }

  async createLocalUser(email: string, password: string, firstName?: string, lastName?: string): Promise<UserEntity> {
    const hashedPassword = await this.hashPassword(password);
    
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      provider: AuthProviderEnum.LOCAL,
    });
    
    return this.userRepository.save(user);
  }

  async createGoogleUser(email: string, googleId: string, firstName?: string, lastName?: string): Promise<UserEntity> {
    const user = this.userRepository.create({
      email,
      googleId,
      firstName,
      lastName,
      provider: AuthProviderEnum.GOOGLE,
    });
    
    return this.userRepository.save(user);
  }

  async validatePassword(user: UserEntity, password: string): Promise<boolean> {
    if (!user.password) {
      return false;
    }
    
    return bcrypt.compare(password, user.password);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
