import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get total clients count
    const totalClients = await prisma.client.count();

    // Get active clients count
    const activeClients = await prisma.client.count({
      where: {
        subscriptionStatus: {
          in: ['ACTIVE', 'TRIAL']
        }
      }
    });

    // Get total agents count
    const totalAgents = await prisma.agent.count();

    // Get active agents count - using a different approach
    // First get all agents
    const agents = await prisma.agent.findMany({
      select: {
        id: true,
        userId: true,
        isActive: true
      }
    });
    
    // Then filter in JavaScript
    const activeAgents = agents.filter(agent => agent.userId !== null && agent.isActive === true).length;

    // Get total conversations count
    const totalConversations = await prisma.clientAnalytics.aggregate({
      _sum: {
        totalConversations: true
      }
    });

    // Get average response time across all clients
    const avgResponseTimeData = await prisma.clientAnalytics.aggregate({
      _avg: {
        avgResponseTime: true
      }
    });

    // Get clients created by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const clientsByMonth = await prisma.client.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Process the data to group by month
    const clientsCreatedByMonth = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        count: 0
      };
    }).reverse();

    // Fill in actual counts
    clientsByMonth.forEach(item => {
      const month = new Date(item.createdAt).toLocaleString('default', { month: 'short' });
      const existingMonth = clientsCreatedByMonth.find(m => m.month === month);
      if (existingMonth) {
        existingMonth.count += item._count.id;
      }
    });

    // Get top clients by conversation volume
    const topClients = await prisma.clientAnalytics.findMany({
      select: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        totalConversations: true,
        avgResponseTime: true
      },
      orderBy: {
        totalConversations: 'desc'
      },
      take: 5
    });

    // Get subscription distribution by plan
    const subscriptionsByPlan = await prisma.subscription.groupBy({
      by: ['plan'],
      _count: {
        id: true
      }
    });

    const formattedSubscriptionsByPlan = subscriptionsByPlan.map(item => ({
      plan: item.plan,
      count: item._count.id
    }));

    return res.status(200).json({
      totalClients,
      activeClients,
      totalAgents,
      activeAgents,
      totalConversations: totalConversations._sum.totalConversations || 0,
      avgResponseTime: Math.round(avgResponseTimeData._avg.avgResponseTime || 0),
      clientsCreatedByMonth,
      topClients,
      subscriptionsByPlan: formattedSubscriptionsByPlan
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ 
      message: 'Error fetching analytics', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}