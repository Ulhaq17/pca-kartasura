import { IsString, IsOptional } from 'class-validator';

export class UpdateProfilSejarahDto {
  @IsOptional()
  @IsString()
  konten?: string;

  @IsOptional()
  @IsString()
  foto?: string;
}
