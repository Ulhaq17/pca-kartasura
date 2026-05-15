import { IsOptional, IsString } from 'class-validator';

export class CreateProfilStrukturOrganisasiDto {
  @IsOptional()
  @IsString()
  foto?: string;
}
