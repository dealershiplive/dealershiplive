import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // For now, we'll skip the authentication check
  
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid subscription ID' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getSubscription(req, res, id);
    case 'PUT':
      return updateSubscription(req, res, id);
    case 'DELETE':
      return deleteSubscription(req, res, id);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET - Retrieve a specific subscription
async function getSubscription(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            websiteUrl: true
          }
        }
      }
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // Ensure client data exists before returning
    if (!subscription.client) {
      return res.status(500).json({ 
        message: 'Subscription data is incomplete - client information missing' 
      });
    }
    
    return res.status(200).json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return res.status(500).json({ message: 'Error fetching subscription' });
  }
}

// PUT - Update a subscription
async function updateSubscription(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { plan, status, startDate, endDate, amount, paymentStatus } = req.body;
  
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { client: true } // Include client to check if it exists
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    if (!subscription.client) {
      return res.status(400).json({ message: 'Subscription has no associated client' });
    }
    
    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        plan: plan || undefined,
        status: status || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        amount: amount ? parseFloat(amount) : undefined,
        paymentStatus: paymentStatus || undefined
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            websiteUrl: true
          }
        }
      }
    });
    
    // Also update the client's subscription status if the status is changed
    if (status && subscription.client) {
      await prisma.client.update({
        where: { id: subscription.client.id },
        data: {
          subscriptionStatus: status,
          subscriptionEndDate: endDate ? new Date(endDate) : undefined
        }
      });
    }
    
    return res.status(200).json(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    return res.status(500).json({ message: 'Error updating subscription' });
  }
}

// DELETE - Delete a subscription
async function deleteSubscription(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { client: true } // Include client to update its status
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // First update the client's subscription status to INACTIVE
    if (subscription.client) {
      await prisma.client.update({
        where: { id: subscription.client.id },
        data: {
          subscriptionStatus: 'INACTIVE',
          // You might want to keep the end date as is or set it to current date
        }
      });
    }
    
    // Then delete the subscription
    await prisma.subscription.delete({
      where: { id }
    });
    
    return res.status(200).json({ message: 'Subscription deleted successfully and client set to inactive' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return res.status(500).json({ message: 'Error deleting subscription' });
  }
} 