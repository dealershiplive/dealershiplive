import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // For now, we'll skip the authentication check
  
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid client ID' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getClient(req, res, id);
    case 'PUT':
      return updateClient(req, res, id);
    case 'DELETE':
      return deleteClient(req, res, id);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET - Retrieve a specific client
async function getClient(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    console.log('API: Fetching client with ID:', id);
    
    // Try a very simple query first to see if it works
    const simpleClient = await prisma.client.findUnique({
      where: { id }
    });
    
    if (!simpleClient) {
      console.log('API: Client not found with ID:', id);
      return res.status(404).json({ message: 'Client not found' });
    }
    
    // Now fetch the client with all the required data
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        users: {
          where: { 
            OR: [
              { role: 'CLIENT_ADMIN' },
              { role: 'ADMIN' }
            ]
          },
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            agents: true
          }
        }
      }
    });
    
    console.log('API: Client found (full):', client);
    return res.status(200).json(client);
  } catch (error) {
    console.error('API: Error in getClient:', error);
    return res.status(500).json({ 
      message: 'Error fetching client',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// PUT - Update a client
async function updateClient(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { 
    name, 
    websiteUrl, 
    adminEmail, 
    adminName, 
    adminPassword,
    adminId,
    subscriptionStatus
  } = req.body;
  
  try {
    // Start a transaction to update both client and admin user
    const result = await prisma.$transaction(async (prisma) => {
      // Update client information
      const updatedClient = await prisma.client.update({
        where: { id },
        data: {
          name,
          websiteUrl,
          subscriptionStatus
        }
      });
      
      // If admin information is provided, update the admin user
      if (adminId && (adminEmail || adminName || adminPassword)) {
        const updateData: any = {};
        
        if (adminName) updateData.name = adminName;
        if (adminEmail) updateData.email = adminEmail;
        
        // If password is provided, hash it
        if (adminPassword && adminPassword.trim() !== '') {
          updateData.password = await bcrypt.hash(adminPassword, 10);
        }
        
        // Only update if there's something to update
        if (Object.keys(updateData).length > 0) {
          await prisma.user.update({
            where: { id: adminId },
            data: updateData
          });
        }
      }
      
      return updatedClient;
    });
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error updating client:', error);
    return res.status(500).json({ 
      message: 'Error updating client', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

// DELETE - Delete a client
async function deleteClient(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { id }
    });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    // Delete all associated users
    await prisma.user.deleteMany({
      where: { clientId: id }
    });
    
    // Delete all associated agents
    await prisma.agent.deleteMany({
      where: { clientId: id }
    });
    
    // Finally, delete the client
    await prisma.client.delete({
      where: { id }
    });
    
    return res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    return res.status(500).json({ message: 'Error deleting client' });
  }
} 