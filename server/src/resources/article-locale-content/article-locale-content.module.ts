import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleLocaleContent } from './entities/article-locale-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleLocaleContent])],
  controllers: [],
  providers: [],
  exports: [],
})
export class ArticleLocaleContentModule {}
