import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateBulletinDto {
  @IsOptional()
  @IsString()
  judul?: string;

  @IsOptional()
  @IsDateString()
  tanggal?: string;
}
