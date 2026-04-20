import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './user.dto';
import { User } from './user.entity';

import { USER_ROLES } from 'src/utlils/enums/user';
import { CurrentUser } from 'src/utlils/decorate/user.decorator';
import { Auth } from 'src/utlils/guards/auth.guard';
import { FileUpload } from 'src/utlils/decorate/file-uploader.decorator';
import { GetFile } from 'src/utlils/decorate/get-file.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto as User);
  }

  @Get('profile')
  @Auth()
  getProfile(@CurrentUser() user: any) {
    return this.userService.getProfile(user.id);
  }

  @Patch('profile')
  @Auth()
  @FileUpload({
    fieldName: 'image',
  })
  updateProfile(
    @CurrentUser() user: any,
    @Body() payload: any,
    @GetFile('image') image: any,
  ) {
    if (image) {
      payload.image = image;
    }
    
    return this.userService.updateProfile(user.id, payload);
  }

  @Get('all')
  getAllUsers(@Query() query: Record<string, any>) {
    return this.userService.getAllUsers(query);
  }
}
