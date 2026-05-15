import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateKegiatanDto {
  @IsNotEmpty()
  @IsString()
  judul: string;

  @IsNotEmpty()
  @IsString()
  deskripsi: string;

  @IsNotEmpty()
  @IsDateString()
  tanggal: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  programKerjaId: number;

  @IsOptional()
  foto?: string[];
}
