import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getAgents(req, res);
    case 'POST':
      return createAgent(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

// Get all agents for a client
async function getAgents(req: NextApiRequest, res: NextApiResponse) {
  const { clientId } = req.query;

  if (!clientId) {
    return res.status(400).json({ message: 'Client ID is required' });
  }

  try {
    // First get all users with AGENT role for this client
    const users = await prisma.user.findMany({
      where: {
        clientId: clientId as string,
        role: 'AGENT'
      },
      include: {
        agentProfile: true
      }
    });

    // Map users to the expected agent format
    const agents = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isOnline: user.agentProfile?.isOnline || false,
      isActive: user.agentProfile?.isOnline || false,
      createdAt: user.createdAt.toISOString()
    }));

    return res.status(200).json({ agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return res.status(500).json({ 
      message: 'Error fetching agents',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Create a new agent
async function createAgent(req: NextApiRequest, res: NextApiResponse) {
  const { name, email, password, role, isActive, clientId } = req.body;

  if (!name || !email || !password || !clientId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create the user with AGENT role
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'AGENT',
        clientId,
        // Create the agent profile in the same transaction
        agentProfile: {
          create: {
            isOnline: false,
            clientId
          }
        }
      },
      include: {
        agentProfile: true
      }
    });

    // Format the response
    const agent = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isOnline: newUser.agentProfile?.isOnline || false,
      isActive: true,
      createdAt: newUser.createdAt.toISOString()
    };

    return res.status(201).json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    return res.status(500).json({ 
      message: 'Error creating agent',
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 