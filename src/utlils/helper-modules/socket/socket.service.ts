// socket.service.ts
import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.getway';

@Injectable()
export class SocketService {
  constructor(private readonly gateway: SocketGateway) {}

  // emit to all users
  emit(event: string, payload: any) {
    this.gateway.server.emit(event, payload);
  }

  on(event: string, callback: (data: any) => void) {
    this.gateway.server.on(event, callback);
  }

  // emit to specific user
  emitToUser(userId: string, event: string, payload: any) {
    this.gateway.server.to(userId).emit(event, payload);
  }

  // emit to room
  emitToRoom(room: string, event: string, payload: any) {
    this.gateway.server.to(room).emit(event, payload);
  }
}