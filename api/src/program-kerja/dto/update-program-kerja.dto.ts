import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProgramKerjaDto {
  @IsOptional()
  @IsString()
  judul?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  majelisLembagaId?: number;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsString()
  foto?: string;
}
