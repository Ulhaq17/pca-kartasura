import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateArtikelKegiatanDto {
  @IsOptional()
  @IsString()
  judul?: string;

  @IsOptional()
  @IsDateString()
  tanggal?: string;

  @IsOptional()
  @IsString()
  penulis?: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  majelisLembagaId?: number;

  @IsOptional()
  @IsString()
  sampul?: string;
}
