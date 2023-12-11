import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { errorMsgs } from '../shared/error-messages';

export const documentExtensionsRegExp = /\.(pdf)$/;

export const documentFilter = (req, file, callback) => {
  if (
    !extname(file.originalname)
      .toLocaleLowerCase()
      .match(documentExtensionsRegExp)
  ) {
    return callback(
      new BadRequestException(errorMsgs.invalidFileFormat),
      false,
    );
  }
  callback(null, true);
};
