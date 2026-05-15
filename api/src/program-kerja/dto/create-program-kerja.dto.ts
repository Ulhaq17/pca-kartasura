import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateProgramKerjaDto {
  @IsNotEmpty()
  @IsString()
  judul: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  majelisLembagaId: number;

  @IsNotEmpty()
  @IsString()
  deskripsi: string;

  @IsOptional()
  @IsString()
  foto?: string;
}
