// src/main.ts
import { Logger, VersioningType } from '@nestjs/common';

// import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@pipes/validation.pipe';
import { AppModule } from './app.module';
import { RsExceptionFilter } from './utils/exceptions/rs-exception.filter';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(
    AppModule,
    // new FastifyAdapter({ logger: false }), // turn on/off for production
  );
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  const appPort = configService.get<number>('PORT', 5400);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new RsExceptionFilter());

  app.setGlobalPrefix('api').enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // app.useGlobalGuards(new AuthGuard(reflector));

  const config = new DocumentBuilder()
    .setTitle('Rahat Platform')
    .setDescription('Rahat Platform')
    .setVersion('0.1')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    // .addBearerAuth(
    //   {
    //     scheme: 'Bearer',
    //     bearerFormat: 'Bearer',
    //     type: 'apiKey',
    //     name: 'rs-access-token',
    //     description: 'Enter access token here',
    //     in: 'header',
    //   },
    //   'rs-access-token',
    // ) // This name here is important for matching up with @ApiBearerAuth() in your controller!)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  console.log(`Listening on port ${appPort}...`);
  console.log(`Swagger UI: http://localhost:${appPort}/api/docs`);

  logger.log(`Application listening on port ${appPort}`);

  await app.listen(appPort);
}
bootstrap();
