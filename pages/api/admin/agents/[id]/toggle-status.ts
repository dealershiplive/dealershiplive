import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const { isActive } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Agent ID is required' });
  }

  if (isActive === undefined) {
    return res.status(400).json({ message: 'isActive status is required' });
  }

  try {
    // Find the user first
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        agentProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // If the user has an agent profile, update it
    if (user.agentProfile) {
      await prisma.agent.update({
        where: { id: user.agentProfile.id },
        data: { 
          // Use isOnline as a proxy for active status
          isOnline: Boolean(isActive)
        }
      });
    } else {
      // If no agent profile exists, create one
      await prisma.agent.create({
        data: {
          userId: user.id,
          clientId: user.clientId as string,
          isOnline: Boolean(isActive)
        }
      });
    }

    return res.status(200).json({ 
      message: `Agent ${isActive ? 'activated' : 'deactivated'} successfully`,
      isActive
    });
  } catch (error) {
    console.error('Error toggling agent status:', error);
    return res.status(500).json({ 
      message: 'Error updating agent status',
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 