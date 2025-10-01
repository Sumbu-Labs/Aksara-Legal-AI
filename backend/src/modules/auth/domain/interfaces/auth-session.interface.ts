import { AuthenticatedUser } from './authenticated-user.interface';
import { Tokens } from './tokens.interface';

export interface AuthSession extends Tokens {
  user: AuthenticatedUser;
}
