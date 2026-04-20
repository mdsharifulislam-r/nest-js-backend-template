import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthResetPasswordDto, ChangePasswordDto, ForgetPasswordDto, LoginDto, VerifyEmailDto } from './auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ResetToken, User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { ApiError } from 'src/utlils/errors/api-error';
import sendResponse from 'src/utlils/helper/sendResponse';
import cryptoToken from 'src/utlils/helper/cryptoToken';
import { comparePassword, hashPassword } from 'src/utlils/helper/bycrptHelper';
import { JwtService } from '@nestjs/jwt';
import generateOTP from 'src/utlils/helper/generateOtp';
import { emailTemplate } from 'src/utlils/shared/emailTemplate';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(ResetToken)
    private resetTokenRepo: Repository<ResetToken>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}
  async verifyOtp(payload: VerifyEmailDto) {
    const { email, oneTimeCode } = payload;
    const user = await this.userRepo.findOne({ where: { email },select:{id:true,name:true,email:true,password:true,verified:true,status:true,role:true,authentication:true} }) as User;
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
    };
    
    if (user?.authentication?.oneTimeCode != oneTimeCode) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'Invalid one time code');
    }

    if (new Date(user?.authentication?.expireAt!) < new Date()) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'One time code expired');
    }

    if (!user?.authentication?.isResetPassword) {
      await this.userRepo.update(
        { id: user.id },
        {
          authentication: {
            isResetPassword: false,
            oneTimeCode: null,
            expireAt: null,
          },
          verified: true,
        },
      );
      return sendResponse({
        statusCode: HttpStatus.OK,
        message: 'Email verified successfully',
        data: user,
        success: true,
      });
    }

    const token = cryptoToken();

    await this.resetTokenRepo.save(
      this.resetTokenRepo.create({
        token,
        userId: user.id,
      }),
    );
    return sendResponse({
      statusCode: HttpStatus.OK,
      message: 'Email verified successfully',
      data: { token },
      success: true,
    });
  }

  async login(payload:LoginDto){
    const user = await this.userRepo.findOne({where:{email:payload.email},select:{id:true,name:true,email:true,password:true,verified:true,status:true,role:true,authentication:true}}) as User
    if(!user){
      throw new ApiError(HttpStatus.NOT_FOUND,'User not found')
    }

    
    if(!user?.verified){
      throw new ApiError(HttpStatus.BAD_REQUEST,'Email not verified')
    }
    if(user?.status === 'delete'){
      throw new ApiError(HttpStatus.BAD_REQUEST,'Your account has been deleted or deactivated')
    }
    
    const isMatchPassword = await comparePassword(payload.password,user.password)
    if(!isMatchPassword){
      throw new ApiError(HttpStatus.BAD_REQUEST,'Invalid credentials')
    }

    const accessToken = this.jwtService.sign({id:user.id,role:user.role,email:user.email})

    return sendResponse({
      statusCode:HttpStatus.OK,
      message:'Login successfully',
      data:{accessToken,role:user.role},
      success:true
    })
    
  }

  async forgotPassword(payload:ForgetPasswordDto){
    const existUser = await this.userRepo.findOne({where:{email:payload.email}}) as User
    if(!existUser){
      throw new ApiError(HttpStatus.NOT_FOUND,'User not found')
    }
    if(existUser?.status === 'delete'){
      throw new ApiError(HttpStatus.BAD_REQUEST,'Your account has been deleted or deactivated')
    }
    const otp = generateOTP()
    const emailTempla= emailTemplate.resetPassword({email:existUser.email,otp:otp});
    this.emailService.sendEmail(emailTempla);
    await this.userRepo.update({id:existUser.id},{authentication:{isResetPassword:true,oneTimeCode:otp,expireAt:new Date(new Date().setMinutes(new Date().getMinutes() + 3))}})
    return sendResponse({
      statusCode:HttpStatus.OK,
      message:'Email sent successfully',
      data:{email:existUser.email},
      success:true
    })
  }

  async resetPassword(payload:AuthResetPasswordDto,token:string){
    const resetToken = await this.resetTokenRepo.findOne({where:{token:token}}) as ResetToken
    if(!resetToken){
      throw new ApiError(HttpStatus.NOT_FOUND,'Reset token not found')
    }
    const user = await this.userRepo.findOne({where:{id:resetToken.userId},select:{id:true,name:true,email:true,password:true,verified:true,status:true,role:true,authentication:true}}) as User
    if(!user){
      throw new ApiError(HttpStatus.NOT_FOUND,'User not found')
    }
    if(user?.status === 'delete'){
      throw new ApiError(HttpStatus.BAD_REQUEST,'Your account has been deleted or deactivated')
    }
    const isMatchPassword = await comparePassword(payload.newPassword,user.password)
    if(isMatchPassword){
      throw new ApiError(HttpStatus.BAD_REQUEST,'New password and old password are same')
    }
    await this.userRepo.update({id:user.id},{password:hashPassword(payload.newPassword),authentication:{isResetPassword:false,oneTimeCode:null,expireAt:null}})
    await this.resetTokenRepo.delete({id:resetToken.id})
    return sendResponse({
      statusCode:HttpStatus.OK,
      message:'Password reset successfully',
      data:{email:user.email},
      success:true
    })
  }
  async changePassword(payload:ChangePasswordDto,userId:string){
    const user = await this.userRepo.findOne({where:{id:userId},select:{id:true,name:true,email:true,password:true,verified:true,status:true,role:true,authentication:true}}) as User
    if(!user){
      throw new ApiError(HttpStatus.NOT_FOUND,'User not found')
    }
    if(user?.status === 'delete'){
      throw new ApiError(HttpStatus.BAD_REQUEST,'Your account has been deleted or deactivated')
    }
    if(payload.confirmPassword !== payload.newPassword){
      throw new ApiError(HttpStatus.BAD_REQUEST,'New password and confirm password are not same')
    }
    const isMatchPassword = await comparePassword(payload.currentPassword,user.password)
    if(!isMatchPassword){
      throw new ApiError(HttpStatus.BAD_REQUEST,'Invalid credentials')
    }
    await this.userRepo.update({id:user.id},{password:hashPassword(payload.newPassword)})
    return sendResponse({
      statusCode:HttpStatus.OK,
      message:'Password changed successfully',
      data:{email:user.email},
      success:true
    })
  }
}
