import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Conversation ID is required' });
  }

  try {
    // Mark the conversation as inactive
    await prisma.conversation.update({
      where: { id },
      data: { 
        status: 'INACTIVE',
        lastActiveAt: new Date()
      }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking conversation as inactive:', error);
    return res.status(500).json({ error: 'Failed to mark conversation as inactive' });
  }
} 