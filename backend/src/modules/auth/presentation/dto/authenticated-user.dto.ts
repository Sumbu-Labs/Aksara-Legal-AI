import { ApiProperty } from '@nestjs/swagger';
import { AuthenticatedUser } from '../../domain/interfaces/authenticated-user.interface';

export class AuthenticatedUserDto implements AuthenticatedUser {
  @ApiProperty({ description: 'Unique identifier of the authenticated user' })
  id: string;

  @ApiProperty({ description: 'Email address associated with the user account' })
  email: string;

  @ApiProperty({ description: 'Display name of the user' })
  name: string;

  constructor(user: AuthenticatedUser) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
  }
}
