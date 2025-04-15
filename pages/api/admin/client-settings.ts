import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user.clientId || !['CLIENT_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const clientId = session.user.clientId;
  
  if (req.method === 'GET') {
    try {
      // Get the client settings
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: {
          id: true,
          name: true,
          websiteUrl: true,
          widgetColor: true,
          widgetCompanyName: true,
          widgetAgentName: true,
          widgetWelcomeMessage: true,
        },
      });
      
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      return res.status(200).json(client);
    } catch (error) {
      console.error('Error fetching client settings:', error);
      return res.status(500).json({ error: 'Failed to fetch client settings' });
    }
  } else if (req.method === 'PUT') {
    try {
      const {
        id,
        name,
        websiteUrl,
        widgetColor,
        widgetCompanyName,
        widgetAgentName,
        widgetWelcomeMessage,
      } = req.body;
      
      // Ensure the client ID matches the session client ID
      if (id !== clientId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // Update the client settings
      const updatedClient = await prisma.client.update({
        where: { id: clientId },
        data: {
          name,
          websiteUrl,
          widgetColor,
          widgetCompanyName,
          widgetAgentName,
          widgetWelcomeMessage,
        },
      });
      
      return res.status(200).json(updatedClient);
    } catch (error) {
      console.error('Error updating client settings:', error);
      return res.status(500).json({ error: 'Failed to update client settings' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 