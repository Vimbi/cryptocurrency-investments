import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleFile } from './entities/article-file.entity';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class ArticleFilesService {
  constructor(
    @InjectRepository(ArticleFile)
    private repository: Repository<ArticleFile>,
  ) {}

  /**
   * Returns ArticleFile by find options
   * @param findOptions find options
   * @return ArticleFile or undefined
   */

  async findOne(
    findOptions:
      | FindOptionsWhere<ArticleFile>
      | FindOptionsWhere<ArticleFile>[],
  ) {
    return await this.repository.findOneBy(findOptions);
  }

  /**
   * Returns ArticleFiles
   * @param findOptions find options
   * @returns array of ArticleFiles
   */

  async find(
    findOptions:
      | FindOptionsWhere<ArticleFile>
      | FindOptionsWhere<ArticleFile>[],
  ) {
    return await this.repository.find({ where: findOptions });
  }

  /**
   * Removes ArticleFiles
   * @param findOptions find options
   * @returns void
   */

  async delete(findOptions: FindOptionsWhere<ArticleFile>) {
    await this.repository.delete(findOptions);
  }
}
