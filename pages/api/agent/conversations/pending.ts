import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, ConversationStatus } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clientId } = req.query;
    
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    // Find all pending conversations for this client
    const pendingConversations = await prisma.conversation.findMany({
      where: {
        status: ConversationStatus.PENDING,
        clientId: clientId as string, // Filter by clientId
      },
      orderBy: {
        createdAt: 'asc', // Oldest first
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    // Format the response
    const formattedConversations = pendingConversations.map(conv => ({
      id: conv.id,
      customerName: conv.customerName || 'Anonymous',
      customerEmail: conv.customerEmail || null,
      createdAt: conv.createdAt.toISOString(),
      endedAt: conv.endedAt?.toISOString() || null,
      lastActiveAt: conv.lastActiveAt?.toISOString() || null,
      type: conv.type,
      lastMessage: conv.messages[0]?.content || null,
      waitingTime: Math.floor((new Date().getTime() - conv.createdAt.getTime()) / 1000) // in seconds
    }));

    return res.status(200).json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error fetching pending conversations:', error);
    return res.status(500).json({ error: 'Failed to fetch pending conversations' });
  }
}