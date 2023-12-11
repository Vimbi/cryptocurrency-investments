import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { documentExtensionsRegExp } from './document-filter';

export const editFileName = (fileOriginalName: string) => {
  const randomName = uuidv4();
  const fileExtName = extname(fileOriginalName);
  const time = Date.now();
  if (!fileExtName.toLocaleLowerCase().match(documentExtensionsRegExp)) {
    return { fileName: `${randomName}-${time}.jpeg`, extension: '.jpeg' };
  }
  return {
    fileName: `${randomName}-${time}${fileExtName}`,
    extension: fileExtName,
  };
};
