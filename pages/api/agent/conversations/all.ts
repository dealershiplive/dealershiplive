import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { clientId } = req.query;
  
  if (!clientId) {
    return res.status(400).json({ error: 'Client ID is required' });
  }

  try {
    console.log('Fetching conversations for client:', clientId);
    
    // Get all conversations for this client
    const conversations = await prisma.conversation.findMany({
      where: {
        clientId: clientId as string
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        lastActiveAt: 'desc'
      }
    });

    // Format the response
    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      customerName: conv.customerName || 'Anonymous',
      customerEmail: conv.customerEmail,
      status: conv.status,
      type: conv.type,
      createdAt: conv.createdAt.toISOString(),
      endedAt: conv.endedAt ? conv.endedAt.toISOString() : null,
      lastActiveAt: conv.lastActiveAt ? conv.lastActiveAt.toISOString() : null,
      lastMessage: conv.messages[0]?.content || null,
      lastMessageTime: conv.messages[0]?.createdAt.toISOString() || null
    }));

    return res.status(200).json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
}