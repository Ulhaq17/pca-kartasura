import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateBulletinDto {
  @IsNotEmpty()
  @IsString()
  judul: string;

  @IsNotEmpty()
  @IsDateString()
  tanggal: string;
}
