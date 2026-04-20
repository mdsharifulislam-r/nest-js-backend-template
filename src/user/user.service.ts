import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { ApiError } from 'src/utlils/errors/api-error';
import { EmailService } from 'src/email/email.service';
import { emailTemplate } from 'src/utlils/shared/emailTemplate';
import generateOTP from 'src/utlils/helper/generateOtp';
import sendResponse from 'src/utlils/helper/sendResponse';
import { cleanObject } from 'src/utlils/helper/cleanObject';
import TypeOrmQueryBuilder from 'src/utlils/queryBuilder/queryBuilder';
import { CacheService } from 'src/utlils/helper-modules/cache/cache.service';
import { KafkaService } from 'src/utlils/helper-modules/kafka/kafka.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private emailService: EmailService,

  ) {}

  async create(user: User) {
    const exist = (await this.userRepo.findOne({
      where: { email: user.email },
    })) as User;
    if (exist) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'User already exist');
    }
    const userData = await this.userRepo.save(this.userRepo.create(user));

    if (!userData) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'User not created');
    }
    const otp = generateOTP();
    const emailTempla = emailTemplate.createAccount({
      name: userData.name,
      email: userData.email,
      otp: otp,
    });
    this.emailService.sendEmail(emailTempla);
    await this.userRepo.update(
      { id: userData.id },
      {
        authentication: {
          isResetPassword: false,
          oneTimeCode: otp,
          expireAt: new Date(
            new Date().setMinutes(new Date().getMinutes() + 3),
          ),
        },
      },
    );
    return userData;
  }
  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
    }
    return sendResponse({
      statusCode: HttpStatus.OK,
      data: user,
      success: true,
      message: 'Profile fetched successfully',
    });
  }
  async updateProfile(userId: string, payload: User) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
    }
    if (!payload) {
      return sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        data: null,
        success: false,
        message: 'Nothing to update',
      });
    }
    const newUser = (await this.userRepo.update(userId, cleanObject(payload)))
      .raw;
    return sendResponse({
      statusCode: HttpStatus.OK,
      data: newUser,
      success: true,
      message: 'Profile updated successfully',
    });
  }


  async getAllUsers(query: Record<string, any>) {
    const qb = new TypeOrmQueryBuilder(this.userRepo, query, 'user').paginate().search(['name','email'])
    const [data,pagination] = await Promise.all([qb.getMany(),qb.getPaginationInfo()])
    const res = sendResponse({
      statusCode: HttpStatus.OK,
      data,
      pagination,
      success: true,
      message: 'Users fetched successfully',
    });

    return res
  }
}
