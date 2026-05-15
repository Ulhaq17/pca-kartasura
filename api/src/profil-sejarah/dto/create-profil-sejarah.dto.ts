import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateProfilSejarahDto {
  @IsNotEmpty()
  @IsString()
  konten!: string;

  @IsOptional()
  @IsString()
  foto?: string;
}
