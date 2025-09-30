import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PermitType } from '../../../business-profile/domain/enums/permit-type.enum';

export class AskRequestDto {
  @ApiProperty({
    description: 'Pertanyaan natural language yang akan dijawab AI.',
    example: 'Apa persyaratan utama untuk sertifikasi halal bagi UMKM?',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(2000)
  question!: string;

  @ApiProperty({
    description: 'Jenis perizinan untuk membatasi konteks jawaban.',
    enum: PermitType,
    required: false,
    example: PermitType.HALAL,
  })
  @IsOptional()
  @IsEnum(PermitType)
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? (value.toUpperCase() as PermitType) : undefined,
  )
  permitType?: PermitType;

  @ApiProperty({
    description: 'Kode wilayah untuk penyesuaian peraturan.',
    required: false,
    example: 'DIY',
    default: 'DIY',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.toUpperCase() : undefined,
  )
  region?: string;
}
