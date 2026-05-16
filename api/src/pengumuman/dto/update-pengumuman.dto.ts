import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdatePengumumanDto {
  @IsOptional()
  @IsString()
  judul?: string;

  @IsOptional()
  @IsDateString()
  tanggal?: string;
}
