import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'

interface Room {
  id: string
  name: string
  users: Map<string, { id: string; name: string }>
}

interface ChatMessage {
  roomId: string
  sender: {
    id: string
    name: string
  }
  content: string
  timestamp: number
}

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server
  private logger: Logger = new Logger('EventsGateway')
  private connectedClients: Map<string, { socket: Socket; name: string; lastHeartbeat: number }> = new Map()
  private rooms: Map<string, Room> = new Map()
  private heartbeatTimeout = 30000 // 30 seconds
  private heartbeatInterval = 10000 // 10 seconds

  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, {
      socket: client,
      name: `用户${client.id.slice(0, 6)}`,
      lastHeartbeat: Date.now()
    })
    this.logger.log(`Client connected: ${client.id}`)

    // 发送房间列表给新连接的客户端
    this.sendRoomList(client)
    // 初始化心跳检测
    this.setupHeartbeat(client)
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id)
    this.logger.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('setName')
  handleSetName(@ConnectedSocket() client: Socket, @MessageBody() name: string) {
    const clientInfo = this.connectedClients.get(client.id)
    if (clientInfo) {
      clientInfo.name = name
      this.broadcastUserList()
    }
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(@ConnectedSocket() client: Socket, @MessageBody() roomName: string) {
    const roomId = `room_${Date.now()}`
    const room: Room = {
      id: roomId,
      name: roomName,
      users: new Map()
    }
    this.rooms.set(roomId, room)
    this.broadcastRoomList()
    return { roomId, name: roomName }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
    const room = this.rooms.get(roomId)
    const clientInfo = this.connectedClients.get(client.id)
    if (room && clientInfo) {
      room.users.set(client.id, { id: client.id, name: clientInfo.name })
      client.join(roomId)
      this.broadcastToRoom(roomId, 'userJoined', { userId: client.id, userName: clientInfo.name })
      this.broadcastRoomUsers(roomId)
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
    const room = this.rooms.get(roomId)
    if (room) {
      room.users.delete(client.id)
      client.leave(roomId)
      const clientInfo = this.connectedClients.get(client.id)
      if (clientInfo) {
        this.broadcastToRoom(roomId, 'userLeft', { userId: client.id, userName: clientInfo.name })
      }
      this.broadcastRoomUsers(roomId)
    }
  }

  @SubscribeMessage('roomMessage')
  handleRoomMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string }
  ) {
    const room = this.rooms.get(data.roomId)
    const clientInfo = this.connectedClients.get(client.id)
    if (room && clientInfo && room.users.has(client.id)) {
      const message: ChatMessage = {
        roomId: data.roomId,
        sender: { id: client.id, name: clientInfo.name },
        content: data.content,
        timestamp: Date.now()
      }
      this.broadcastToRoom(data.roomId, 'roomMessage', message)
    }
  }

  @SubscribeMessage('privateMessage')
  handlePrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { to: string; content: string }
  ) {
    const targetClient = this.connectedClients.get(data.to)
    const senderInfo = this.connectedClients.get(client.id)
    if (targetClient && senderInfo) {
      targetClient.socket.emit('privateMessage', {
        from: { id: client.id, name: senderInfo.name },
        content: data.content,
        timestamp: Date.now()
      })
    }
  }

  private sendRoomList(client: Socket) {
    const roomList = Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      userCount: room.users.size
    }))
    client.emit('roomList', roomList)
  }

  private broadcastRoomList() {
    const roomList = Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      userCount: room.users.size
    }))
    this.server.emit('roomList', roomList)
  }

  private broadcastRoomUsers(roomId: string) {
    const room = this.rooms.get(roomId)
    if (room) {
      const users = Array.from(room.users.values())
      this.server.to(roomId).emit('roomUsers', users)
    }
  }

  private broadcastUserList() {
    const users = Array.from(this.connectedClients.entries()).map(([id, info]) => ({
      id,
      name: info.name
    }))
    this.server.emit('userList', users)
  }

  private broadcastToRoom(roomId: string, event: string, message: any) {
    this.server.to(roomId).emit(event, message)
  }

  @SubscribeMessage('heartbeat')
  handleHeartbeat(@ConnectedSocket() client: Socket) {
    const clientInfo = this.connectedClients.get(client.id)
    if (clientInfo) {
      clientInfo.lastHeartbeat = Date.now()
      client.emit('heartbeat_ack')
    }
  }

  private setupHeartbeat(client: Socket) {
    // 定期发送心跳包
    const heartbeatTimer = setInterval(() => {
      const clientInfo = this.connectedClients.get(client.id)
      if (!clientInfo) {
        clearInterval(heartbeatTimer)
        return
      }

      // 检查上次心跳时间
      const now = Date.now()
      if (now - clientInfo.lastHeartbeat > this.heartbeatTimeout) {
        this.logger.warn(`Client ${client.id} heartbeat timeout`)
        client.disconnect()
        clearInterval(heartbeatTimer)
        return
      }

      // 发送心跳包
      client.emit('heartbeat')
    }, this.heartbeatInterval)

    // 当客户端断开连接时清除定时器
    client.on('disconnect', () => {
      clearInterval(heartbeatTimer)
    })
  }

  private handleReconnection(client: Socket) {
    // 在断开连接5秒后尝试重新连接
    setTimeout(() => {
      if (!this.connectedClients.has(client.id)) {
        // 使用 socket.io 客户端重新连接的事件监听方式
        client.on('connect', () => {
          this.logger.log(`Client reconnected: ${client.id}`)
        })
      }
    }, 5000)
  }
}
