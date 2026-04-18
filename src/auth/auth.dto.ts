import { IsEmail, IsNumber, IsString, MinLength } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsNumber()
  oneTimeCode: number;
}

export class ForgetPasswordDto {
  @IsEmail()
  email: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class AuthResetPasswordDto {
  @IsString()
  @MinLength(8)
  newPassword: string;

  @IsString()
  @MinLength(8)
  confirmPassword: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;

  @IsString()
  @MinLength(8)
  confirmPassword: string;
}