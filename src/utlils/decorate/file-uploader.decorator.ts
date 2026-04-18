import {
  applyDecorators,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

type UploadOptions = {
  fieldName: string;
  multiple?: boolean;
  maxCount?: number;
  destination?: string;
  maxSizeMB?: number;
  allowedMimeTypes?: RegExp;
};

export function FileUpload(options: UploadOptions) {
  let {
    fieldName,
    multiple = false,
    maxCount = 1,
    destination = './uploads',
    maxSizeMB = 5,
    allowedMimeTypes = /\/(jpg|jpeg|png|pdf)/,
  } = options;
  destination = destination+`/${fieldName}`
  const storage = diskStorage({
    destination,
    filename: (req, file, cb) => {
      const unique =
        Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${unique}${extname(file.originalname)}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!file.mimetype.match(allowedMimeTypes)) {
      return cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
  };

  const limits = {
    fileSize: maxSizeMB * 1024 * 1024,
  };

  const interceptor = multiple
    ? FilesInterceptor(fieldName, maxCount, {
        storage,
        fileFilter,
        limits,
      })
    : FileInterceptor(fieldName, {
        storage,
        fileFilter,
        limits,
      });

  return applyDecorators(UseInterceptors(interceptor));
}