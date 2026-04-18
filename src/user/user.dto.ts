import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { USER_ROLES } from 'src/utlils/enums/user';


class AuthenticationDto {
  @IsBoolean()
  isResetPassword: boolean;

  @IsNumber()
  oneTimeCode: number;

  @Type(() => Date)
  expireAt: Date;
}

export class CreateUserDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(USER_ROLES)
  role: USER_ROLES;

  @IsOptional()
  @IsString()
  contact: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsEnum(['active', 'delete'])
  status: 'active' | 'delete';

  @IsOptional()
  @IsBoolean()
  verified: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => AuthenticationDto)
  authentication?: AuthenticationDto;
}