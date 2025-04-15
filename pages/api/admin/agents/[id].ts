import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Agent ID is required' });
  }

  switch (method) {
    case 'GET':
      return getAgent(req, res, id);
    case 'PUT':
      return updateAgent(req, res, id);
    case 'DELETE':
      return deleteAgent(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

// Get a single agent
async function getAgent(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        agentProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Format the response
    const agent = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isOnline: user.agentProfile?.isOnline || false,
      isActive: user.agentProfile?.isOnline || false,
      createdAt: user.createdAt.toISOString()
    };

    return res.status(200).json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    return res.status(500).json({ 
      message: 'Error fetching agent',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Update an agent
async function updateAgent(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { name, email, password, role, isActive, clientId } = req.body;

  if (!name || !email || !clientId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        agentProfile: true
      }
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Check if email is already in use by another user
    if (email !== existingUser.email) {
      const emailInUse = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id }
        }
      });

      if (emailInUse) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email
    };

    // Only update password if provided
    if (password) {
      updateData.password = await bcryptjs.hash(password, 10);
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        agentProfile: true
      }
    });

    // Format the response
    const agent = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isOnline: updatedUser.agentProfile?.isOnline || false,
      isActive: updatedUser.agentProfile?.isOnline || false,
      createdAt: updatedUser.createdAt.toISOString()
    };

    return res.status(200).json(agent);
  } catch (error) {
    console.error('Error updating agent:', error);
    return res.status(500).json({ 
      message: 'Error updating agent',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Delete an agent
async function deleteAgent(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        agentProfile: true
      }
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Delete the agent profile first (due to foreign key constraints)
    if (existingUser.agentProfile) {
      await prisma.agent.delete({
        where: { id: existingUser.agentProfile.id }
      });
    }

    // Then delete the user
    await prisma.user.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return res.status(500).json({ 
      message: 'Error deleting agent',
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 