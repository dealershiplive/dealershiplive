import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, MessageType } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { senderId, senderRole } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid conversation ID' });
  }

  if (!senderId) {
    return res.status(400).json({ error: 'Sender ID is required' });
  }

  try {
    // Get the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        supportTicket: true
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Create a video request message
    const message = await prisma.conversationMessage.create({
      data: {
        content: 'Video call requested',
        ticketId: conversation.supportTicket.id,
        senderId,
        senderRole,
        messageType: MessageType.VIDEO_REQUEST
      }
    });

    // Update conversation lastActiveAt
    await prisma.conversation.update({
      where: { id },
      data: { lastActiveAt: new Date() }
    });

    return res.status(200).json({ success: true, message });
  } catch (error) {
    console.error('Error creating video request:', error);
    return res.status(500).json({ 
      error: 'Failed to create video request',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 