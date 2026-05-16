import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArtikelKajianDto {
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

  @IsOptional()
  @IsString()
  sampul?: string;
}
