import * as path from 'path';
import * as cookieParser from 'cookie-parser';
import * as appRoot from 'app-root-path';
import { config } from 'aws-sdk';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { Logger, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { configuration } from './logging/configuration';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { DEVELOPMENT } from './utils/constants/common-constants';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(configuration),
  });
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      enableDebugMessages: true,
      validateCustomDecorators: true,
    }),
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useStaticAssets(path.join(appRoot.path, 'static'), {
    prefix: '/static/',
  });

  const logger = app.get(Logger);
  app.useGlobalInterceptors(new LoggingInterceptor(logger));
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  const nodeEnv = configService.get('app.nodeEnv');

  const swagger = new DocumentBuilder()
    .setTitle('Nephrite trade')
    .setDescription('Nephrite API description')
    .setVersion('1.0')
    .addBearerAuth();

  if (nodeEnv !== DEVELOPMENT) swagger.addServer('/api');

  const swaggerConfig = swagger.build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  });

  config.update({
    accessKeyId: configService.get('file.accessKeyId'),
    secretAccessKey: configService.get('file.secretAccessKey'),
  });

  app.use(helmet());
  app.use(cookieParser());

  await app.listen(configService.get('app.port'));
  return configService.get('app.port');
}
bootstrap().then((PORT) =>
  Logger.log(`App is running on http://localhost:${PORT}`),
);
