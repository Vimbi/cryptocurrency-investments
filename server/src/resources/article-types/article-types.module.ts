import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleType } from './entities/article-type.entity';
import { ArticleTypesController } from './article-types.controller';
import { ArticleTypesService } from './article-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleType])],
  controllers: [ArticleTypesController],
  providers: [ArticleTypesService],
  exports: [ArticleTypesService],
})
export class ArticleTypesModule {}
