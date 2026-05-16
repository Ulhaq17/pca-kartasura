import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePeranDto {
  @IsNotEmpty()
  @IsString()
  nama: string;

  @IsOptional()
  @IsString()
  keterangan?: string;
}
