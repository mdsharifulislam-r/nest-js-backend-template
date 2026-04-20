import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './utlils/inspectors/logger.inspector';
import { ValidationPipe } from '@nestjs/common';
import { formatValidationErrors } from './utlils/errors/validator-error';;
import 'reflect-metadata';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    logger: ['log', 'error', 'warn', 'debug'],
  });
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    exceptionFactory:formatValidationErrors,
    transform: true,
  }));
  app.enableShutdownHooks()

  // await connectKafkaMicroService(app); // only for kafka microservice, if you have other microservices you can create separate function for each and call here

  // await app.startAllMicroservices(); // IMPORTANT



  //documentation
  const config = new DocumentBuilder()
  .setTitle('My API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);

SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000,process.env.IP_ADDRESS || '0.0.0.0',()=>{
    console.log(`Server running on port ${process.env.PORT ?? 5000}`);
  });
}
bootstrap();
