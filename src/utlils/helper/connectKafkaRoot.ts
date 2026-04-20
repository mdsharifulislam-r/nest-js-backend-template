import { Transport } from '@nestjs/microservices';

export async function connectKafkaMicroService(app: any) {
  try {
    app.connectMicroservice({
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [process.env.KAFKA_URL],
        },
        consumer: {
          groupId: 'my-consumer-app',
        },
      },
    });
  } catch (error) {
    console.log(error);
  }
}
