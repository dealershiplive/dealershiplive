import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, ConversationStatus } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { conversationId, agentId } = req.body;

    if (!conversationId || !agentId) {
      return res.status(400).json({ error: 'Conversation ID and Agent ID are required' });
    }

    // Check if the conversation is still waiting
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.status !== 'WAITING') {
      return res.status(400).json({ 
        error: 'Conversation is no longer available',
        status: conversation.status
      });
    }

    // Assign the conversation to the agent
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        agent: {
          connect: { id: agentId }
        },
        status: 'ACTIVE',
        lastActiveAt: new Date()
      }
    });

    // Create a system message indicating the agent has joined
    await prisma.message.create({
      data: {
        content: `Agent has joined the conversation`,
        conversation: {
          connect: { id: conversationId }
        },
        sender: 'system',
        status: 'SENT'
      }
    });

    return res.status(200).json({ 
      success: true, 
      conversation: updatedConversation 
    });
  } catch (error) {
    console.error('Error accepting conversation:', error);
    return res.status(500).json({ 
      error: 'Failed to accept conversation',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}