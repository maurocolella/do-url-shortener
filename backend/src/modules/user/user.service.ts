import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, AuthProviderEnum } from './entities/user.entity';
import * as crypto from 'crypto';
import { promisify } from 'util';

// Promisify the scrypt function
const scryptAsync = promisify(crypto.scrypt);

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
    
    // Split the stored password into salt and hash
    const [salt, storedHash] = user.password.split(':');
    
    // Hash the input password with the same salt
    const hash = await this.hashWithSalt(password, salt);
    
    // Compare the hashes
    return storedHash === hash;
  }

  private async hashPassword(password: string): Promise<string> {
    // Generate a random salt
    const salt = crypto.randomBytes(16).toString('hex');
    
    // Hash the password with the salt
    const hash = await this.hashWithSalt(password, salt);
    
    // Return salt and hash concatenated
    return `${salt}:${hash}`;
  }
  
  private async hashWithSalt(password: string, salt: string): Promise<string> {
    // Use scrypt with N=16384, r=8, p=1, keylen=64
    const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
    return derivedKey.toString('hex');
  }
}
