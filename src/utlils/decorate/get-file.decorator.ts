import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { getPublicUrl } from "../helper/nomaliseFiles";

export const GetFile = createParamDecorator(
  (data: keyof any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const file = request.files ? request.files : request.file;
  
    if (!file) return null;
    // default: return full file object
    return getPublicUrl(request.file ? request.file : request.files[data]);
  },
);