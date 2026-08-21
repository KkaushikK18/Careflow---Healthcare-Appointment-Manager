import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getMessages(userId: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      include: {
        sender: { include: { doctorProfile: true, patientProfile: true, } },
        recipient: { include: { doctorProfile: true, patientProfile: true, } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async sendMessage(senderId: string, recipientId: string, content: string) {
    return this.prisma.message.create({
      data: {
        senderId,
        recipientId,
        content
      }
    });
  }
}
