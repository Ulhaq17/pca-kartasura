import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateAnggotaDto {
  @IsOptional()
  @IsString()
  nama?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  peranId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  majelisLembagaId?: number;
}
