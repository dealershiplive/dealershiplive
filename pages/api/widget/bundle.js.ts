import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Set the content type to JavaScript
    res.setHeader('Content-Type', 'application/javascript');
    
    // Path to the pre-built widget bundle
    const bundlePath = path.join(process.cwd(), 'public/widget/widget-bundle.js');
    
    // Check if the bundle exists
    if (fs.existsSync(bundlePath)) {
      // Read the bundle file
      const bundle = fs.readFileSync(bundlePath, 'utf8');
      res.status(200).send(bundle);
    } else {
      // If the bundle doesn't exist, return a fallback or error
      console.error('Widget bundle not found. Run "npm run build:widget" to generate it.');
      res.status(500).json({ error: 'Widget bundle not found' });
    }
  } catch (error) {
    console.error('Error serving widget bundle:', error);
    res.status(500).json({ error: 'Failed to serve widget bundle' });
  }
} 