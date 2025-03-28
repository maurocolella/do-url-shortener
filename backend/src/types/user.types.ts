/**
 * Interface for User entity
 */
export interface IUser {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for User creation DTO
 */
export interface ICreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  provider?: string;
}

/**
 * Interface for User update DTO
 */
export interface IUpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

/**
 * Interface for User login DTO
 */
export interface ILoginUserDto {
  email: string;
  password: string;
}
