import { S3 } from 'aws-sdk';
import * as mime from 'mime-types';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { errorMsgs } from '../../shared/error-messages';
import { IUploadFile } from '../../types/files/upload-file';
import slugify from 'slugify';
import { slugifyConfig } from '../../utils/slugify/configuration';

@Injectable()
export class YandexCloudService {
  private _bucket: string;
  constructor(private configService: ConfigService) {
    this._bucket = this.configService.get('file.defaultS3Bucket');
  }

  /**
   * S3 Cloud connection module initialization
   * @returns S3 module
   */

  async moduleS3Init() {
    return new S3({
      endpoint: `https://storage.yandexcloud.net`,
    });
  }

  /**
   * File upload to Yandex Object Storage
   * @param dto data to upload
   * @returns upload result
   * @throws BadRequestException if upload error
   */

  async uploadFile(dto: IUploadFile) {
    const { name, buffer, folder, displayName, extension } = dto;
    const mimeType = mime.lookup(name);
    if (!mimeType) {
      throw new BadRequestException(errorMsgs.mimeTypeNotDefined);
    }
    const s3 = await this.moduleS3Init();
    const upload = await s3
      .upload({
        Bucket: this._bucket,
        Body: buffer,
        Key: `${folder}/${name}`,
        ContentType: mimeType,
        ContentDisposition: `inline; filename="${slugify(
          displayName,
          slugifyConfig,
        )}${extension}"`,
      })
      .promise();
    if (!upload) {
      throw new BadRequestException(errorMsgs.s3FileUploadError);
    }
    if (upload && !Array.isArray(upload)) {
      return upload;
    }
  }

  /**
   * File delete from Yandex Object Storage
   * @param key file key
   * @returns void
   * @throws BadRequestException if deletion error
   */

  async deleteFile(key: string) {
    const s3 = await this.moduleS3Init();
    return await s3
      .deleteObject({
        Bucket: this._bucket,
        Key: key,
      })
      .promise();
  }
}
