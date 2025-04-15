import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, ConversationType, ConversationStatus } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clientId, customerName, customerEmail, initialMessage } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    // Get the client to access their widget configuration
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        widgetWelcomeMessage: true,
        widgetAgentName: true
      }
    });

    if (!client) {
      return res.status(400).json({ error: 'Client not found' });
    }

    // Find any agent for this client to temporarily assign the conversation
    const anyAgent = await prisma.user.findFirst({
      where: {
        clientId: clientId,
        role: 'AGENT'
      }
    });
    
    if (!anyAgent) {
      return res.status(400).json({ error: 'No agents found for this client' });
    }

    // Create a new conversation
    const conversation = await prisma.conversation.create({
      data: {
        client: {
          connect: { id: clientId }
        },
        agent: {
          connect: { id: anyAgent.id } // Connect to any agent temporarily
        },
        customerName: customerName || 'Anonymous',
        customerEmail: customerEmail || null,
        status: ConversationStatus.WAITING, // Start as waiting until an agent accepts
        type: 'CHAT' as ConversationType,
        lastActiveAt: new Date()
      }
    });

    // If there's an initial message from the customer, create it
    if (initialMessage) {
      await prisma.message.create({
        data: {
          content: initialMessage,
          conversation: {
            connect: { id: conversation.id }
          },
          sender: 'customer',
          status: 'SENT'
        }
      });
    }

    // Send a welcome message from the agent/system
    const welcomeMessage = client.widgetWelcomeMessage || "Hello! How can we help you today?";
    await prisma.message.create({
      data: {
        content: welcomeMessage,
        conversation: {
          connect: { id: conversation.id }
        },
        sender: 'agent', // Send as agent instead of system
        status: 'SENT'
      }
    });

    return res.status(201).json({ 
      success: true, 
      conversationId: conversation.id 
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return res.status(500).json({ 
      error: 'Failed to create conversation',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}