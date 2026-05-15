import { IsOptional, IsString } from 'class-validator';

export class UpdateProfilStrukturOrganisasiDto {
  @IsOptional()
  @IsString()
  foto?: string;
}
