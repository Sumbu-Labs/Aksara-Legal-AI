import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({ description: 'Email yang terdaftar' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password pengguna', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
