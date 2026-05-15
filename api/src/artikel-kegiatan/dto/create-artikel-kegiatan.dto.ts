import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateArtikelKegiatanDto {
  @IsNotEmpty()
  @IsString()
  judul: string;

  @IsNotEmpty()
  @IsDateString()
  tanggal: string;

  @IsNotEmpty()
  @IsString()
  penulis: string;

  @IsNotEmpty()
  @IsString()
  deskripsi: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  majelisLembagaId: number;

  @IsOptional()
  @IsString()
  sampul?: string;
}
