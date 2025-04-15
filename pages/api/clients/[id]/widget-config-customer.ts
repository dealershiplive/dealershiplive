import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    // Fetch client configuration
    const client = await prisma.client.findUnique({
      where: { id: id as string },
      select: {
        widgetColor: true,
        widgetCompanyName: true,
        widgetAgentName: true,
        widgetWelcomeMessage: true,
        name: true // Fallback for company name
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Return the configuration
    return res.status(200).json({
      widgetColor: client.widgetColor || '#4f46e5', // Default color
      widgetCompanyName: client.widgetCompanyName || client.name, // Use client name as fallback
      widgetAgentName: client.widgetAgentName || 'Support Agent', // Default agent name
      widgetWelcomeMessage: client.widgetWelcomeMessage || 'Hello! How can we help you today?' // Default welcome message
    });
  } catch (error) {
    console.error('Error fetching client configuration:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch client configuration',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 