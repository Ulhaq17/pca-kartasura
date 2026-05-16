import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateArtikelKajianDto {
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
  @IsString()
  sampul?: string;
}
