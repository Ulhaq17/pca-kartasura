import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMajelisLembagaDto {
  @IsNotEmpty()
  @IsString()
  nama: string;

  @IsNotEmpty()
  @IsString()
  deskripsi: string;

  @IsNotEmpty()
  @IsString()
  namaKetua: string;

  @IsNotEmpty()
  @IsString()
  bioKetua: string;

  @IsOptional()
  @IsString()
  fotoKetua?: string;

  @IsOptional()
  @IsString()
  sampulMajelis?: string;

  @IsOptional()
  @IsString()
  videoProfil?: string;
}
