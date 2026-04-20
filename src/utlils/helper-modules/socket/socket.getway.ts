// socket.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';

@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log(
      chalk.blueBright.bold('[SOCKET]') +
        chalk.white(' Gateway Initialized 🚀'),
    );
  }

  handleConnection(client: any) {
    console.log(
      chalk.greenBright.bold('[SOCKET CONNECT]') +
        chalk.green(` Client connected: `) +
        chalk.white(client.id),
    );
  }

  handleDisconnect(client: any) {
    console.log(
      chalk.redBright.bold('[SOCKET DISCONNECT]') +
        chalk.red(` Client disconnected: `) +
        chalk.white(client.id),
    );
  }
}