import React from 'react';
import ReactDOM from 'react-dom';
import ChatWidget from '../../components/widget/ChatWidget';

// Create a namespace for the widget
window.SupportWidget = {
  init: function(config) {
    const { container, ...props } = config;
    const containerElement = document.getElementById(container) || document.createElement('div');
    
    if (!containerElement.id) {
      containerElement.id = 'support-widget-container';
      document.body.appendChild(containerElement);
    }
    
    // Create a wrapper component to properly pass props
    function WidgetWrapper() {
      return React.createElement(ChatWidget, props);
    }
    
    ReactDOM.render(
      React.createElement(WidgetWrapper, null),
      containerElement
    );
  }
};

// TypeScript declaration for the global namespace
declare global {
  interface Window {
    SupportWidget: {
      init: (config: {
        clientId: string;
        container?: string;
        primaryColor?: string;
        secondaryColor?: string;
        position?: 'right' | 'left';
        welcomeMessage?: string;
        companyName?: string;
        agentName?: string;
        logoUrl?: string;
      }) => void;
    };
  }
} 