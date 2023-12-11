import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { ArticleTypesModule } from '../article-types/article-types.module';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    ArticleTypesModule,
    UsersModule,
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, Logger],
  exports: [ArticlesService],
})
export class ArticleModule {}
