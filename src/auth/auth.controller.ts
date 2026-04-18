import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResetPasswordDto, ChangePasswordDto, ForgetPasswordDto, LoginDto, VerifyEmailDto } from './auth.dto';
import { CurrentUser } from 'src/utlils/decorate/user.decorator';
import { Auth } from 'src/utlils/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @Post('verify-otp')
  verifyOtp(@Body() payload: VerifyEmailDto) {
    return this.authService.verifyOtp(payload);
  }

  @Post('forgot-password')
  forgotPassword(@Body() payload: ForgetPasswordDto) {
    return this.authService.forgotPassword(payload);
  }

  @Post('reset-password')
  resetPassword(@Body() payload: AuthResetPasswordDto, @Req() req: any) {
    const token = req.headers.authorization;
    return this.authService.resetPassword(payload, token);
  }

  @Post('change-password')
  @Auth()
  changePassword(@Body() payload: ChangePasswordDto, @CurrentUser() user: any) {
    return this.authService.changePassword(payload, user.id);
  }
}
