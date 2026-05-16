import { IsOptional, IsString } from 'class-validator';

export class UpdateSekolahDto {
  @IsOptional()
  @IsString()
  nama?: string;

  @IsOptional()
  @IsString()
  foto?: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsString()
  lokasi?: string;
}
