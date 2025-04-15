import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // For now, we'll skip the authentication check
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getSubscriptions(req, res);
    case 'POST':
      return createSubscription(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET - Retrieve all subscriptions
async function getSubscriptions(req: NextApiRequest, res: NextApiResponse) {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.status(200).json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return res.status(500).json({ message: 'Error fetching subscriptions' });
  }
}

// POST - Create a new subscription
async function createSubscription(req: NextApiRequest, res: NextApiResponse) {
  const { clientId, plan, status, startDate, endDate, amount, paymentStatus } = req.body;
  
  console.log('Creating subscription with data:', { clientId, plan, status, startDate, endDate });
  
  if (!clientId || !plan || !status) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try {
    // Parse dates properly
    const parsedStartDate = startDate ? new Date(startDate) : new Date();
    let parsedEndDate;
    
    if (endDate) {
      parsedEndDate = new Date(endDate);
    } else {
      // Default to 1 year from start date if not provided
      parsedEndDate = new Date(parsedStartDate);
      parsedEndDate.setFullYear(parsedEndDate.getFullYear() + 1);
    }
    
    // Validate dates
    if (isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({ message: 'Invalid start date format' });
    }
    
    if (isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ message: 'Invalid end date format' });
    }
    
    // Create the subscription
    const subscription = await prisma.subscription.create({
      data: {
        clientId,
        plan,
        status,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        amount: amount ? parseFloat(amount) : 0,
        paymentStatus: paymentStatus || 'PENDING'
      },
    });
    
    // Update the client's subscription status and end date
    await prisma.client.update({
      where: { id: clientId },
      data: {
        subscriptionStatus: status,
        subscriptionEndDate: parsedEndDate
      }
    });
    
    console.log('Subscription created successfully:', subscription.id);
    return res.status(201).json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({ message: 'Error creating subscription', error: error instanceof Error ? error.message : String(error) });
  }
} 