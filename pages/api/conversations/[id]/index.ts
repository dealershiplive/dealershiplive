import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Conversation ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
          agent: {
            select: {
              name: true
            }
          },
          client: {
            select: {
              name: true,
              widgetCompanyName: true
            }
          }
        }
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      return res.status(200).json({ 
        conversation: {
          ...conversation,
          agentName: conversation.agent.name
        } 
      });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}