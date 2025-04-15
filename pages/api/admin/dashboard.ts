import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { clientId } = req.query;

  if (!clientId) {
    return res.status(400).json({ message: 'Client ID is required' });
  }

  try {
    console.log('Fetching dashboard data for clientId:', clientId);
    
    // Get total agents for this client
    const totalAgents = await prisma.agent.count({
      where: {
        clientId: clientId as string
      }
    });
    console.log('Total agents:', totalAgents);

    // Get online agents count
    const onlineAgents = await prisma.agent.count({
      where: {
        clientId: clientId as string,
        isOnline: true
      }
    });
    console.log('Online agents:', onlineAgents);

    // Mock data for now
    const activeChats = 0;
    const activeCalls = 0;
    const totalChatsToday = 0;
    const totalCallsToday = 0;
    const avgCallDuration = 0;
    const avgResponseTime = 0;

    // Get agents without trying to select specific fields
    const agents = await prisma.agent.findMany({
      where: {
        clientId: clientId as string
      }
    });
    console.log('Fetched agents:', agents.length);

    // Create agent status array with available fields
    const agentStatus = agents.map(agent => ({
      id: agent.id,
      // Use email as a fallback if name isn't available
      name: agent.email,
      status: agent.isOnline ? 'online' : 'offline'
    }));

    // Mock recent activity
    const recentActivity = [];

    const responseData = {
      stats: {
        activeChats,
        activeCalls,
        totalAgents,
        onlineAgents,
        totalChatsToday,
        totalCallsToday,
        avgResponseTime,
        avgCallDuration
      },
      agentStatus,
      recentActivity
    };
    
    console.log('Sending response data');
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return res.status(500).json({ 
      message: 'Error fetching dashboard data',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
} 