import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreatePengumumanDto {
  @IsNotEmpty()
  @IsString()
  judul: string;

  @IsNotEmpty()
  @IsDateString()
  tanggal: string;
}
