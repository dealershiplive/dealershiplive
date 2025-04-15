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
    console.log('Fetching active conversations for client:', clientId);
    
    // Get all active and waiting conversations for this client
    const activeConversations = await prisma.conversation.findMany({
      where: {
        clientId: clientId as string,
        status: {
          in: ['ACTIVE', 'WAITING']
        }
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
        createdAt: 'desc'
      }
    });

    console.log(`Found ${activeConversations.length} active conversations`);

    // Format the data for the frontend
    const formattedConversations = activeConversations.map(conv => ({
      id: conv.id,
      customerName: conv.customerName || 'Anonymous Customer',
      type: conv.type.toLowerCase(),
      startTime: conv.createdAt.toISOString(),
      status: conv.status.toLowerCase(),
      lastMessage: conv.messages[0]?.content || null,
      lastMessageTime: conv.messages[0]?.createdAt.toISOString() || null
    }));

    return res.status(200).json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error fetching active conversations:', error);
    return res.status(500).json({ error: 'Failed to fetch active conversations' });
  }
}