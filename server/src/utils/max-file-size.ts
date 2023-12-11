import { config } from 'dotenv';
import { FileEnum } from '../resources/files/files.enum';

config();

export const maxFileSize = (feature: FileEnum) => {
  if (feature === FileEnum.document) {
    return { fileSize: parseInt(process.env.FILE_MAX_DOC_SIZE, 10) };
  }
  return { fileSize: parseInt(process.env.FILE_MAX_IMAGE_SIZE, 10) };
};
