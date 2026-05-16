import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateAgendaDto {
  @IsNotEmpty()
  @IsString()
  judul: string;

  @IsNotEmpty()
  @IsString()
  deskripsi: string;

  @IsNotEmpty()
  @IsDateString()
  tanggal: string;

  @IsNotEmpty()
  @IsDateString()
  waktuMulai: string;

  @IsNotEmpty()
  @IsDateString()
  waktuSelesai: string;

  @IsNotEmpty()
  @IsString()
  tempat: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  majelisId: number;
}
