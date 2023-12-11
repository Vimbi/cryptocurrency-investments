import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleFile } from './entities/article-file.entity';
import { ArticleFilesService } from './article-files.service';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleFile])],
  controllers: [],
  providers: [ArticleFilesService],
  exports: [ArticleFilesService],
})
export class ArticleFilesModule {}
