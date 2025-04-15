import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set the content type to CSS
  res.setHeader('Content-Type', 'text/css');
  
  // Define the CSS for the widget
  const css = `
    /* Base styles for the widget */
    #support-widget-container * {
      box-sizing: border-box;
    }
    
    /* Fix for potential conflicts with host site */
    #support-widget-container .fixed {
      position: fixed !important;
    }
    
    #support-widget-container .absolute {
      position: absolute !important;
    }
    
    #support-widget-container .relative {
      position: relative !important;
    }
    
    /* Ensure the widget container doesn't inherit problematic styles */
    #support-widget-container {
      font-size: 16px;
      line-height: 1.5;
      color: #333;
    }
    
    /* Ensure z-index is high enough */
    #support-widget-container .z-50 {
      z-index: 9999 !important;
    }
    
    /* Additional styles to ensure widget displays correctly */
    #support-widget-container button {
      cursor: pointer;
    }
    
    #support-widget-container input,
    #support-widget-container button {
      font-family: inherit;
    }
  `;
  
  res.status(200).send(css);
} 