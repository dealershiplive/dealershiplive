import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // For now, we'll skip the authentication check
  // In a production environment, you would want to properly authenticate requests
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getClients(req, res);
    case 'POST':
      return createClient(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET - Retrieve all clients
async function getClients(req: NextApiRequest, res: NextApiResponse) {
  try {
    const clients = await prisma.client.findMany({
      include: {
        _count: {
          select: {
            agents: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return res.status(500).json({ message: 'Error fetching clients' });
  }
}

// POST - Create a new client
async function createClient(req: NextApiRequest, res: NextApiResponse) {
  const { 
    name, 
    websiteUrl, 
    adminEmail, 
    adminName, 
    adminPassword = 'tempPassword123',
    subscriptionStatus = 'TRIAL',
    subscriptionEndDate
  } = req.body;
  
  console.log('Creating client with data:', { 
    name, 
    websiteUrl, 
    adminEmail, 
    adminName, 
    subscriptionStatus,
    subscriptionEndDate 
  });
  
  if (!name || !websiteUrl || !adminEmail || !adminName) {
    console.log('Missing required fields:', { name, websiteUrl, adminEmail, adminName });
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try {
    // Check if a client with this name already exists
    const existingClient = await prisma.client.findFirst({
      where: { name }
    });
    
    if (existingClient) {
      console.log('Client with this name already exists:', name);
      return res.status(400).json({ message: 'A client with this name already exists' });
    }
    
    // Check if admin email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingUser) {
      console.log('Email already in use:', adminEmail);
      return res.status(400).json({ message: 'This email is already in use' });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Create the client and admin user in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Set default subscription end date if not provided
      let endDate;
      if (subscriptionEndDate) {
        endDate = new Date(subscriptionEndDate);
      } else {
        // Default to 30 days from now for trial
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
      }
      
      // Create the client with the provided or default subscription status and end date
      const client = await prisma.client.create({
        data: {
          name,
          websiteUrl,
          subscriptionStatus: subscriptionStatus,
          subscriptionEndDate: endDate,
        }
      });
      
      // Create the admin user for this client
      const admin = await prisma.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          role: 'CLIENT_ADMIN',
          clientId: client.id,
          password: hashedPassword
        }
      });
      
      return { client, admin };
    });
    
    console.log('Client created successfully:', result.client.id);
    return res.status(201).json(result.client);
  } catch (error) {
    console.error('Error creating client:', error);
    return res.status(500).json({ message: 'Error creating client', error: error instanceof Error ? error.message : String(error) });
  }
} 