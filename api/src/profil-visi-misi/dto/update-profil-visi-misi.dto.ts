import { IsOptional, IsString } from 'class-validator';

export class UpdateProfilVisiMisiDto {
  @IsOptional()
  @IsString()
  visi?: string;

  @IsOptional()
  @IsString()
  misi?: string;
}
