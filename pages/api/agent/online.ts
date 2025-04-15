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
    // Get all agents for this client
    const agents = await prisma.user.findMany({
      where: {
        clientId: clientId as string,
        role: 'AGENT',
        agentProfile: {
          isNot: null
        }
      },
      select: {
        id: true,
        name: true,
        agentProfile: true
      }
    });

    // Filter for online agents
    const onlineAgents = agents
      .filter(agent => agent.agentProfile?.isOnline)
      .map(agent => ({
        id: agent.id,
        name: agent.name
      }));

    return res.status(200).json({ agents: onlineAgents });
  } catch (error) {
    console.error('Error fetching online agents:', error);
    return res.status(500).json({ error: 'Failed to fetch online agents' });
  }
}