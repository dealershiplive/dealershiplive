import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getAgentStatus(req, res);
  } else if (req.method === 'PUT') {
    return updateAgentStatus(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET - Retrieve agent status
async function getAgentStatus(req: NextApiRequest, res: NextApiResponse) {
  const { agentId } = req.query;

  if (!agentId || typeof agentId !== 'string') {
    return res.status(400).json({ error: 'Agent ID is required' });
  }

  try {
    // Try to find the agent profile
    const agent = await prisma.agent.findFirst({
      where: { userId: agentId },
    });

    if (!agent) {
      // If no agent profile exists, check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: agentId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return default status for user without agent profile
      return res.status(200).json({ isOnline: false });
    }

    return res.status(200).json({ isOnline: agent.isOnline });
  } catch (error) {
    console.error('Error getting agent status:', error);
    return res.status(500).json({ error: 'Failed to get agent status' });
  }
}

// PUT - Update agent status
async function updateAgentStatus(req: NextApiRequest, res: NextApiResponse) {
  const { agentId, isOnline } = req.body;

  console.log('Updating agent status with:', { agentId, isOnline });

  if (!agentId) {
    return res.status(400).json({ error: 'Agent ID is required' });
  }

  if (typeof isOnline !== 'boolean') {
    return res.status(400).json({ error: 'isOnline must be a boolean value' });
  }

  try {
    // First, check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: agentId },
      include: { client: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Found user:', { id: user.id, email: user.email, clientId: user.clientId, role: user.role });

    // Make sure the user has a client ID
    if (!user.clientId) {
      return res.status(400).json({ error: 'User is not associated with a client' });
    }

    // Find or create the agent profile
    let agent = await prisma.agent.findFirst({
      where: { userId: agentId },
    });

    if (!agent) {
      // Create agent profile if it doesn't exist
      console.log('Creating new agent profile for user:', agentId);
      agent = await prisma.agent.create({
        data: {
          user: { connect: { id: agentId } },
          client: { connect: { id: user.clientId } },
          isOnline,
          lastActive: new Date(),
        },
      });
      
      console.log('Created new agent profile:', agent);
    } else {
      // Update existing agent profile
      console.log('Updating existing agent profile:', agent.id);
      agent = await prisma.agent.update({
        where: { id: agent.id },
        data: {
          isOnline,
          lastActive: new Date(),
        },
      });
      
      console.log('Updated agent profile:', agent);
    }
    
    return res.status(200).json({ 
      isOnline: agent.isOnline,
      agentId: agent.id,
      userId: agent.userId,
      clientId: agent.clientId
    });
  } catch (error) {
    console.error('Error updating agent status:', error);
    return res.status(500).json({ error: 'Failed to update agent status' });
  }
} 