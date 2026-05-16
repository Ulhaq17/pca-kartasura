import { IsOptional, IsString } from 'class-validator';

export class UpdatePeranDto {
  @IsOptional()
  @IsString()
  nama?: string;

  @IsOptional()
  @IsString()
  keterangan?: string;
}
