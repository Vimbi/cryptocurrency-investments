import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleTypeLocaleContent } from './entities/article-type-locale-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleTypeLocaleContent])],
  controllers: [],
  providers: [],
  exports: [],
})
export class ArticleTypeLocaleContentModule {}
