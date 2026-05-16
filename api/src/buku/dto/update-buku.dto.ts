import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateBukuDto {
  @IsOptional()
  @IsString()
  judul?: string;

  @IsOptional()
  @IsString()
  penulis?: string;

  @IsOptional()
  @IsDateString()
  tanggal?: string;
}
