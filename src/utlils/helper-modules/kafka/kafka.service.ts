import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import chalk from 'chalk';

@Injectable()
export class KafkaService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafka: ClientKafka,
  ) {}

  async onModuleInit() {
    // important for send()
    this.kafka.subscribeToResponseOf('utils-event');

    await this.kafka.connect();
    console.log(chalk.green('Kafka connected successfully'));
  }

  emit(topic: string, message: any) {
    return this.kafka.emit(topic, {
      value: message, // IMPORTANT
    });
  }

  send(topic: string, message: any) {
    return this.kafka.send(topic, {
      value: message, // IMPORTANT
    });
  }
}