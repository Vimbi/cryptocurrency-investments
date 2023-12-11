import * as sharp from 'sharp';
import { extname, basename } from 'path';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { File } from './entities/file.entity';
import { ICreateFile } from './dto/create-file.interface';
import { YandexCloudService } from '../yandex-cloud/yandex-cloud.service';
import { errorMsgs } from '../../shared/error-messages';
import { IMulterUpload } from '../../types/files/multer-upload.interface';
import { editFileName } from '../../utils/edit-file-name';
import { qbFindFiles } from '../../utils/query-builders/find-files';
import { GetQueryDto } from '../../types/get-query.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private repository: Repository<File>,
    private yandexCloudService: YandexCloudService,
  ) {}

  /**
   * Create new File
   * @param data data to create File
   * @returns created File
   */

  async create(data: ICreateFile) {
    const insertResult = await this.repository.insert(data);
    return await this.repository.findOneBy({
      id: insertResult.identifiers[0].id,
    });
  }

  /**
   * Upload image
   * @param dto data to save image
   * @returns created File entity
   */

  async uploadImage(dto: IMulterUpload) {
    const { file, folder } = dto;
    const fileBuffer = await sharp(file.buffer)
      .resize({ height: 1000 })
      .toFormat('jpeg')
      .toBuffer();

    const { fileName, extension } = editFileName(file.originalname);
    const displayName = Buffer.from(
      basename(file.originalname, extname(file.originalname)),
      'latin1',
    ).toString('utf8');

    const uploadResult = await this.yandexCloudService.uploadFile({
      name: fileName,
      buffer: fileBuffer,
      folder,
      displayName,
      extension,
    });

    const data: ICreateFile = {
      path: uploadResult.Location,
      name: fileName,
      extension,
      key: uploadResult.Key,
      displayName,
    };

    return await this.create(data);
  }

  /**
   * Upload document
   * @param dto data to save document
   * @returns created File entity
   */

  async uploadDocument(dto: IMulterUpload) {
    const { file, folder } = dto;

    const { fileName, extension } = editFileName(file.originalname);
    const displayName = Buffer.from(
      basename(file.originalname, extname(file.originalname)),
      'latin1',
    ).toString('utf8');

    const uploadResult = await this.yandexCloudService.uploadFile({
      name: fileName,
      buffer: file.buffer,
      folder,
      displayName,
      extension,
    });

    const data: ICreateFile = {
      path: uploadResult.Location,
      name: fileName,
      extension,
      key: uploadResult.Key,
      displayName,
    };

    return await this.create(data);
  }

  /**
   * Returns Files by find options
   * @param findOptions find options
   * @returns array of Files
   */

  async find(findOptions: GetQueryDto) {
    return await qbFindFiles(this.repository, findOptions);
  }

  /**
   * Returns File of throw error
   * @param findOptions find options
   * @returns File
   * @throws NotFoundException
   */

  async findOneByOrFail(
    findOptions: FindOptionsWhere<File> | FindOptionsWhere<File>[],
  ) {
    const file = await this.repository.findOne({
      where: findOptions,
    });
    if (!file) {
      throw new NotFoundException(errorMsgs.fileNotExist);
    }
    return file;
  }

  /**
   * Removes File from Yandex Cloud and File entity from Database by find options
   * @param findOptions file find options
   * @returns void
   * @throws InternalServerError if File not found
   */

  async delete(findOptions: FindOptionsWhere<File> | FindOptionsWhere<File>[]) {
    const file = await this.repository.findOne({
      where: findOptions,
      relations: { articleFiles: true, raffleFiles: true },
    });
    if (file) {
      const { articleFiles, raffleFiles } = file;
      if (articleFiles.length || raffleFiles.length) {
        return { result: false, message: errorMsgs.fileRelated };
      }
      const { id, key } = file;
      await this.yandexCloudService.deleteFile(key);
      return await this.repository.delete({ id });
    }
  }
}
