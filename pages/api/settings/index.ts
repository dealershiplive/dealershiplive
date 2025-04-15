import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET and PUT methods
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if SystemSettings exists in the schema
    let settings;
    
    try {
      // GET - Retrieve settings
      if (req.method === 'GET') {
        // Try to get the first settings record
        try {
          settings = await prisma.systemSettings.findFirst();
          
          if (!settings) {
            settings = await prisma.systemSettings.create({
              data: {} // Use default values from schema
            });
          }
        } catch (error) {
          // If the table doesn't exist yet, return default settings
          console.log('SystemSettings table may not exist yet:', error);
          settings = {
            id: 'default',
            platformName: 'SaaS Support Platform',
            supportEmail: 'support@example.com',
            defaultLanguage: 'en',
            maintenanceMode: false,
            passwordMinLength: 8,
            passwordRequireSpecialChar: true,
            passwordRequireNumber: true,
            passwordRequireUppercase: true,
            twoFactorAuthRequired: false,
            sessionTimeout: 60,
            updatedAt: new Date()
          };
        }
        
        // Mask sensitive data
        const maskedSettings = {
          ...settings,
          twilioAuthToken: settings.twilioAuthToken ? '••••••••••••••••••••••••••••••••' : '',
          twilioApiSecret: settings.twilioApiSecret ? '••••••••••••••••••••••••••••••••' : '',
          stripeSecretKey: settings.stripeSecretKey ? '••••••••••••••••••••••••••••••••' : '',
          smtpPassword: settings.smtpPassword ? '••••••••••••••••••••••••' : '',
        };
        
        return res.status(200).json(maskedSettings);
      }
      
      // PUT - Update settings
      if (req.method === 'PUT') {
        const {
          section,
          ...data
        } = req.body;
        
        // Try to get the first settings record
        try {
          settings = await prisma.systemSettings.findFirst();
          
          if (!settings) {
            settings = await prisma.systemSettings.create({
              data: {} // Use default values from schema
            });
          }
          
          // Update only the fields that are provided
          // Don't update sensitive fields if they are masked
          const updateData: any = {};
          
          Object.keys(data).forEach(key => {
            // Skip masked sensitive fields
            if (
              (key === 'twilioAuthToken' && data[key] === '••••••••••••••••••••••••••••••••') ||
              (key === 'twilioApiSecret' && data[key] === '••••••••••••••••••••••••••••••••') ||
              (key === 'stripeSecretKey' && data[key] === '••••••••••••••••••••••••••••••••') ||
              (key === 'smtpPassword' && data[key] === '••••••••••••••••••••••••')
            ) {
              return;
            }
            
            updateData[key] = data[key];
          });
          
          // Update the settings
          const updatedSettings = await prisma.systemSettings.update({
            where: { id: settings.id },
            data: updateData
          });
          
          // Mask sensitive data in response
          const maskedSettings = {
            ...updatedSettings,
            twilioAuthToken: updatedSettings.twilioAuthToken ? '••••••••••••••••••••••••••••••••' : '',
            twilioApiSecret: updatedSettings.twilioApiSecret ? '••••••••••••••••••••••••••••••••' : '',
            stripeSecretKey: updatedSettings.stripeSecretKey ? '••••••••••••••••••••••••••••••••' : '',
            smtpPassword: updatedSettings.smtpPassword ? '••••••••••••••••••••••••' : '',
          };
          
          return res.status(200).json({
            message: `${section} settings updated successfully`,
            settings: maskedSettings
          });
        } catch (error) {
          // If the table doesn't exist yet, return a message to run migrations
          console.log('SystemSettings table may not exist yet:', error);
          return res.status(503).json({ 
            message: 'Database schema needs to be updated. Please run prisma migrations.',
            needsMigration: true
          });
        }
      }
    } catch (error) {
      console.error('Error accessing SystemSettings:', error);
      return res.status(503).json({ 
        message: 'Database schema needs to be updated. Please run prisma migrations.',
        needsMigration: true
      });
    }
  } catch (error) {
    console.error('Error handling settings:', error);
    return res.status(500).json({ 
      message: 'Error handling settings',
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 