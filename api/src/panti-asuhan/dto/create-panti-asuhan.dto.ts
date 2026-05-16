import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePantiAsuhanDto {
  @IsNotEmpty()
  @IsString()
  nama: string;

  @IsOptional()
  @IsString()
  foto?: string;

  @IsNotEmpty()
  @IsString()
  deskripsi: string;

  @IsNotEmpty()
  @IsString()
  lokasi: string;
}
