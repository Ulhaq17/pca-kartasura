import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateKegiatanDto {
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
  @Type(() => Number)
  @IsInt()
  @Min(1)
  programKerjaId?: number;

  @IsOptional()
  foto?: string[];
}
