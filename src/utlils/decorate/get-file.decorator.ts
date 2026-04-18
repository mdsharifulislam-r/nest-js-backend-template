import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { getPublicUrl } from "../helper/nomaliseFiles";

export const GetFile = createParamDecorator(
  (data: keyof any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const file = request.files?.length ? request.files : request.file;
    
    if (!file) return null;

    // If specific property requested
    if (data) {
      return file[data];
    }

    // default: return full file object
    return getPublicUrl(file)
  },
);