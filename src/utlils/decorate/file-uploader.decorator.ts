import { applyDecorators, HttpStatus, UseInterceptors } from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { ApiError } from '../errors/api-error';

type UploadField = {
  fieldName: string;
  maxCount?: number;
  allowedMimeTypes?: RegExp;
};

type UploadOptions = {
  fields?: UploadField[];
  fieldName?: string;
  multiple?: boolean;
  maxCount?: number;
  destination?: string;
  maxSizeMB?: number;
  allowedMimeTypes?: RegExp;
};

export function FileUpload(options: UploadOptions) {
  const {
    fields,
    fieldName,
    multiple = false,
    maxCount = 1,
    destination = './uploads',
    maxSizeMB = 5,
    allowedMimeTypes = /\/(jpg|jpeg|png|pdf)/,
  } = options;

  const storage = diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = join(destination, file.fieldname);

      // auto create folder
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
      const unique =
        Date.now() + '-' + Math.round(Math.random() * 1e9);

      cb(null, unique + extname(file.originalname));
    },
  });

  const fileFilter = (req, file, cb) => {
    let mimeRule = allowedMimeTypes;

    // field specific mime validation
    if (fields && fields.length > 0) {
      const field = fields.find(
        (f) => f.fieldName === file.fieldname,
      );

      if (field?.allowedMimeTypes) {
        mimeRule = field.allowedMimeTypes;
      }
    }

    if (!file.mimetype.match(mimeRule)) {
      return cb(
        new ApiError(HttpStatus.BAD_REQUEST, `Unsupported file type ${file.mimetype}`),
        false,
      );
    }

    cb(null, true);
  };

  const limits = {
    fileSize: maxSizeMB * 1024 * 1024,
  };

  let interceptor;

  // multiple fields
  if (fields && fields.length > 0) {
    interceptor = FileFieldsInterceptor(
      fields.map((f) => ({
        name: f.fieldName,
        maxCount: f.maxCount || 1,
      })),
      { storage, fileFilter, limits },
    );
  }

  // multiple same field
  else if (multiple && fieldName) {
    interceptor = FilesInterceptor(fieldName, maxCount, {
      storage,
      fileFilter,
      limits,
    });
  }

  // single
  else {
    interceptor = FileInterceptor(fieldName!, {
      storage,
      fileFilter,
      limits,
    });
  }

  return applyDecorators(UseInterceptors(interceptor));
}