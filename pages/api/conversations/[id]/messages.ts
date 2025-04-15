import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Conversation ID is required' });
  }

  // GET: Fetch messages for a conversation
  if (req.method === 'GET') {
    try {
      const messages = await prisma.message.findMany({
        where: {
          conversationId: id
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return res.status(200).json({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }
  
  // POST: Send a new message
  else if (req.method === 'POST') {
    const { content, sender, messageType = 'TEXT' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    try {
      // Create the message with the specified type
      const message = await prisma.message.create({
        data: {
          content,
          conversationId: id,
          sender,
          type: messageType // Use the messageType parameter
        }
      });

      return res.status(201).json({ message });
    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({ error: 'Failed to send message' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
} 