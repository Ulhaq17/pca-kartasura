import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProfilVisiMisiDto {
  @IsNotEmpty()
  @IsString()
  visi!: string;

  @IsNotEmpty()
  @IsString()
  misi!: string;
}
