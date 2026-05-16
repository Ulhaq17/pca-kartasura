import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateBukuDto {
  @IsNotEmpty()
  @IsString()
  judul: string;

  @IsNotEmpty()
  @IsString()
  penulis: string;

  @IsNotEmpty()
  @IsDateString()
  tanggal: string;
}
