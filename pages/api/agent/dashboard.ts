import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { agentId, clientId } = req.query;

  if (!agentId || !clientId) {
    return res.status(400).json({ error: 'Agent ID and Client ID are required' });
  }

  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get agent stats
    const chatsToday = await prisma.conversation.count({
      where: {
        agentId: agentId as string,
        type: 'CHAT',
        createdAt: {
          gte: today,
        },
      },
    });

    const callsToday = await prisma.conversation.count({
      where: {
        agentId: agentId as string,
        type: 'CALL',
        createdAt: {
          gte: today,
        },
      },
    });

    // For demo purposes, we'll use mock data for some metrics
    // In a real app, you would calculate these from actual data
    const stats = {
      totalChatsToday: chatsToday,
      totalCallsToday: callsToday,
      avgResponseTime: Math.floor(Math.random() * 30) + 10, // 10-40 seconds
      avgCallDuration: Math.floor(Math.random() * 5) + 2, // 2-7 minutes
      missedChats: Math.floor(Math.random() * 5),
      missedCalls: Math.floor(Math.random() * 3)
    };

    return res.status(200).json({ stats });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}