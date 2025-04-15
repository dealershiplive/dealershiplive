import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This endpoint should be called by a cron job every few minutes
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Optional API key check for security
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.CRON_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Find conversations that haven't had activity in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const inactiveConversations = await prisma.conversation.updateMany({
      where: {
        status: 'ACTIVE',
        lastActiveAt: {
          lt: fiveMinutesAgo
        }
      },
      data: {
        status: 'INACTIVE'
      }
    });

    return res.status(200).json({ 
      success: true,
      inactiveCount: inactiveConversations.count
    });
  } catch (error) {
    console.error('Error checking inactive conversations:', error);
    return res.status(500).json({ error: 'Failed to check inactive conversations' });
  }
} 