import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateAnggotaDto {
  @IsNotEmpty()
  @IsString()
  nama: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  peranId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  majelisLembagaId: number;
}
