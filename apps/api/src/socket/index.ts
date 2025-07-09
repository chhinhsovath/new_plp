import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
// TODO: Implement JWT verification with Clerk
// import { verifyJWT } from "../utils/auth";

export class SocketService {
  private io: Server;
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds

  constructor(server: HTTPServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
      },
    });

    this.initialize();
  }

  private initialize() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error("Authentication error"));
        }

        // TODO: Verify JWT with Clerk
        // const decoded = await verifyJWT(token);
        // if (!decoded) {
        //   return next(new Error("Authentication error"));
        // }

        // socket.data.userId = decoded.userId;
        // For now, extract userId from token (implement proper verification)
        socket.data.userId = "temp-user-id";
        next();
      } catch (err) {
        next(new Error("Authentication error"));
      }
    });

    // Connection handler
    this.io.on("connection", (socket) => {
      const userId = socket.data.userId;
      console.log(`User ${userId} connected`);

      // Add socket to user's socket list
      this.addUserSocket(userId, socket.id);

      // Join user-specific room
      socket.join(`user:${userId}`);

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected`);
        this.removeUserSocket(userId, socket.id);
      });

      // Handle notification read
      socket.on("notification:read", (notificationId: string) => {
        // Broadcast to all user's devices
        this.io.to(`user:${userId}`).emit("notification:marked-read", notificationId);
      });

      // Handle notification read all
      socket.on("notification:read-all", () => {
        // Broadcast to all user's devices
        this.io.to(`user:${userId}`).emit("notification:all-marked-read");
      });
    });
  }

  private addUserSocket(userId: string, socketId: string) {
    const sockets = this.userSockets.get(userId) || [];
    sockets.push(socketId);
    this.userSockets.set(userId, sockets);
  }

  private removeUserSocket(userId: string, socketId: string) {
    const sockets = this.userSockets.get(userId) || [];
    const filtered = sockets.filter((id) => id !== socketId);
    if (filtered.length > 0) {
      this.userSockets.set(userId, filtered);
    } else {
      this.userSockets.delete(userId);
    }
  }

  // Send notification to specific user
  public sendNotification(userId: string, notification: any) {
    this.io.to(`user:${userId}`).emit("notification:new", notification);
  }

  // Send notification to multiple users
  public sendNotificationToUsers(userIds: string[], notification: any) {
    userIds.forEach((userId) => {
      this.sendNotification(userId, notification);
    });
  }

  // Check if user is online
  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  // Get online users count
  public getOnlineUsersCount(): number {
    return this.userSockets.size;
  }
}

export default SocketService;