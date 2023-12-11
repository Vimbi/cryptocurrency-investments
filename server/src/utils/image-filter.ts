import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { errorMsgs } from '../shared/error-messages';

export const extensionsRegExp = /\.(jpg|jpeg|png|webp|avif)$/;

export const imageFilter = (req, file, callback) => {
  if (!extname(file.originalname).toLocaleLowerCase().match(extensionsRegExp)) {
    return callback(
      new BadRequestException(errorMsgs.invalidFileFormat),
      false,
    );
  }
  callback(null, true);
};
