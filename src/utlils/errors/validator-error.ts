import { BadRequestException, ValidationError } from '@nestjs/common';

export const formatValidationErrors = (errors: ValidationError[]) => {
  const formatted = {};

  const mapErrors = (errorList: ValidationError[]) => {
    errorList.forEach((error) => {
      if (error.constraints) {
        formatted[error.property] = Object.values(error.constraints)[0];
      }

      if (error.children && error.children.length > 0) {
        mapErrors(error.children);
      }
    });
  };

  mapErrors(errors);

  return new BadRequestException({
    success: false,
    message: formatted[Object.keys(formatted)[0]],
    errors: formatted,
  });
};