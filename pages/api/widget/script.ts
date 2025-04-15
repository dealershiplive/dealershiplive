import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { clientId } = req.query;
  
  if (!clientId || typeof clientId !== 'string') {
    return res.status(400).json({ error: 'Client ID is required' });
  }

  try {
    // Fetch client configuration from database
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        widgetColor: true,
        widgetCompanyName: true,
        widgetAgentName: true,
        widgetWelcomeMessage: true,
      },
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Set the content type to JavaScript
    res.setHeader('Content-Type', 'application/javascript');
    
    // Get the base URL from the request or environment variable
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
    
    // Generate the widget script with client configuration and absolute URLs
    const script = `
      (function() {
        // Create widget container
        const container = document.createElement('div');
        container.id = 'support-widget-container';
        document.body.appendChild(container);
        
        // Load the widget styles
        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = '${baseUrl}/api/widget/styles.css';
        document.head.appendChild(styles);
        
        // Load Tailwind CSS
        const tailwindStyles = document.createElement('link');
        tailwindStyles.rel = 'stylesheet';
        tailwindStyles.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
        document.head.appendChild(tailwindStyles);
        
        // Function to load script and return a promise
        function loadScript(src) {
          return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.crossOrigin = '';
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }
        
        // Load all required scripts in sequence
        Promise.resolve()
          .then(() => loadScript('https://unpkg.com/react@17/umd/react.production.min.js'))
          .then(() => loadScript('https://unpkg.com/react-dom@17/umd/react-dom.production.min.js'))
          .then(() => loadScript('https://unpkg.com/framer-motion@6/dist/framer-motion.js'))
          .then(() => loadScript('${baseUrl}/api/widget/bundle.js'))
          .then(() => {
            // Initialize the widget with client configuration
            window.SupportWidget.init({
              clientId: '${clientId}',
              primaryColor: '${client.widgetColor || '#4f46e5'}',
              companyName: '${client.widgetCompanyName?.replace(/'/g, "\\'") || 'Support'}',
              agentName: '${client.widgetAgentName?.replace(/'/g, "\\'") || 'Support Agent'}',
              welcomeMessage: '${client.widgetWelcomeMessage?.replace(/'/g, "\\'") || 'Hello! How can we help you today?'}'
            });
          })
          .catch(error => {
            console.error('Error loading widget:', error);
          });
      })();
    `;
    
    res.status(200).send(script);
  } catch (error) {
    console.error('Error generating widget script:', error);
    res.status(500).json({ error: 'Failed to generate widget script' });
  }
}