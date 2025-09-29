import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({ description: 'Nama lengkap pengguna' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email unik pengguna' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password minimal 6 karakter', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
