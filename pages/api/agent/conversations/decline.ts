import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, ConversationStatus } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    // Check if the conversation exists and is in WAITING status
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.status !== 'WAITING') {
      return res.status(400).json({ error: 'Only waiting conversations can be declined' });
    }

    // Update the conversation status to ENDED
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        status: ConversationStatus.ENDED,
        endedAt: new Date()
      }
    });

    // Add a system message about the conversation being declined
    await prisma.message.create({
      data: {
        conversationId: conversationId,
        content: 'Conversation was declined by an agent',
        sender: 'system',
        status: 'SENT'
      }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error declining conversation:', error);
    return res.status(500).json({ 
      error: 'Failed to decline conversation',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}