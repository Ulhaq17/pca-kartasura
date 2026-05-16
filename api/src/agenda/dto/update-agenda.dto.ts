import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateAgendaDto {
  @IsOptional()
  @IsString()
  judul?: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsDateString()
  tanggal?: string;

  @IsOptional()
  @IsDateString()
  waktuMulai?: string;

  @IsOptional()
  @IsDateString()
  waktuSelesai?: string;

  @IsOptional()
  @IsString()
  tempat?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  majelisId?: number;
}
