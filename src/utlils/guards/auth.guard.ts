import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_ROLES } from '../enums/user';
import { ApiError } from '../errors/api-error';
import { JwtService } from '@nestjs/jwt';
import { Roles } from './roles.guard';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<USER_ROLES[]>(
      'roles',
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'You are not authorized');
    }

    try {
      const token = authHeader.split(' ')[1];

      const payload = this.jwtService.verify(token);

      request.user = payload;

      if (roles && roles.length && !roles.includes(payload.role)) {
        throw new ApiError(HttpStatus.FORBIDDEN, "You don't have permission");
      }

      return true;
    } catch (e) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, e.message);
    }
  }
}




export function Auth(...roles: USER_ROLES[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(AuthGuard),
  );
}