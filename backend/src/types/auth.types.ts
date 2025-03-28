import { IUser } from './user.types';

/**
 * Interface for JWT payload
 */
export interface IJwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Interface for authentication response
 */
export interface IAuthResponse {
  user: IUser;
  accessToken: string;
}

/**
 * Interface for Google OAuth profile
 */
export interface IGoogleProfile {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: Array<{
    value: string;
    verified: boolean;
  }>;
  photos: Array<{
    value: string;
  }>;
  provider: string;
}
