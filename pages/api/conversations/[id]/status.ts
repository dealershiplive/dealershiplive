import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, ConversationStatus } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { status } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Conversation ID is required' });
  }

  try {
    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: { 
        status: status as ConversationStatus,
        endedAt: status === 'ENDED' ? new Date() : null
      }
    });

    return res.status(200).json({ conversation: updatedConversation });
  } catch (error) {
    console.error('Error updating conversation status:', error);
    return res.status(500).json({ error: 'Failed to update conversation status' });
  }
} 