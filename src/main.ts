import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './utlils/inspectors/logger.inspector';
import { ValidationPipe } from '@nestjs/common';
import { formatValidationErrors } from './utlils/errors/validator-error';
import { config } from './utlils/config/config';
import { ResponseInterceptor } from './utlils/inspectors/response.interceptor';
import { Transport } from '@nestjs/microservices';
import { connectKafkaMicroService } from './utlils/helper/connectKafkaRoot';


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

  await app.listen(process.env.PORT ?? 3000,process.env.IP_ADDRESS || '0.0.0.0',()=>{
    console.log(`Server running on port ${process.env.PORT ?? 5000}`);
  });
}
bootstrap();
