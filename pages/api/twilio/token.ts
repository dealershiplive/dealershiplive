import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { identity, room, clientId } = req.body;

  if (!identity || !room || !clientId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Get Twilio credentials from system settings
    const settings = await prisma.systemSettings.findFirst();
    
    if (!settings?.twilioAccountSid || !settings?.twilioApiKey || !settings?.twilioApiSecret) {
      return res.status(500).json({ error: 'Twilio credentials not configured' });
    }

    const twilioAccountSid = settings.twilioAccountSid;
    const twilioApiKey = settings.twilioApiKey;
    const twilioApiSecret = settings.twilioApiSecret;

    // Create an access token
    const AccessToken = twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    // Create a Video grant for this token
    const videoGrant = new VideoGrant({
      room: room
    });

    // Create an access token
    const token = new AccessToken(
      twilioAccountSid,
      twilioApiKey,
      twilioApiSecret,
      { identity: identity }
    );

    // Add the video grant to the token
    token.addGrant(videoGrant);

    // Return the token
    return res.status(200).json({ token: token.toJwt() });
  } catch (error) {
    console.error('Error generating Twilio token:', error);
    return res.status(500).json({ error: 'Failed to generate Twilio token' });
  }
} 