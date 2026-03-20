import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class SelectUserRoleDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['CLIENT', 'SALON_OWNER'], {
    message: 'Role must be CLIENT or SALON_OWNER',
  })
  role: 'CLIENT' | 'SALON_OWNER';
}
