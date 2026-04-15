import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class SelectUserRoleDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['SALON_OWNER'], {
    message: 'Role must be SALON_OWNER',
  })
  role: 'SALON_OWNER';
}
