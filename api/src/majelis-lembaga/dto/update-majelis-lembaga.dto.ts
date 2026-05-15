import { IsOptional, IsString } from 'class-validator';

export class UpdateMajelisLembagaDto {
  @IsOptional()
  @IsString()
  nama?: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsString()
  namaKetua?: string;

  @IsOptional()
  @IsString()
  bioKetua?: string;

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
