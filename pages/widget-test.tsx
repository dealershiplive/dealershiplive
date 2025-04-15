import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to avoid hydration issues
const ChatWidget = dynamic(
  () => import('../components/widget/ChatWidget'),
  { ssr: false }
);

export default function WidgetTestPage() {
  const router = useRouter();
  const { clientId, color } = router.query;
  const [widgetConfig, setWidgetConfig] = useState({
    clientId: '',
    primaryColor: '#4f46e5',
    companyName: 'Test Company',
    agentName: 'Test Agent',
    welcomeMessage: 'Hello! How can we help you today?'
  });

  useEffect(() => {
    if (clientId) {
      setWidgetConfig(prev => ({
        ...prev,
        clientId: clientId as string
      }));
    }

    if (color) {
      setWidgetConfig(prev => ({
        ...prev,
        primaryColor: color as string
      }));
    }
  }, [clientId, color]);

  return (
    <>
      <Head>
        <title>Widget Test Page</title>
        <meta name="description" content="Test page for the chat widget" />
      </Head>

      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Widget Test Page</h1>
            <p className="text-gray-600 mb-4">
              This page demonstrates how the chat widget will appear on your website. The widget is shown in the bottom-right corner.
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Widget Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                  <input
                    type="text"
                    value={widgetConfig.clientId}
                    onChange={(e) => setWidgetConfig({...widgetConfig, clientId: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter client ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={widgetConfig.primaryColor}
                      onChange={(e) => setWidgetConfig({...widgetConfig, primaryColor: e.target.value})}
                      className="h-10 w-20 p-1 border border-gray-300 rounded-md"
                    />
                    <span className="ml-3 text-gray-500 text-sm">{widgetConfig.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={widgetConfig.companyName}
                    onChange={(e) => setWidgetConfig({...widgetConfig, companyName: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                  <input
                    type="text"
                    value={widgetConfig.agentName}
                    onChange={(e) => setWidgetConfig({...widgetConfig, agentName: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter agent name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
                  <input
                    type="text"
                    value={widgetConfig.welcomeMessage}
                    onChange={(e) => setWidgetConfig({...widgetConfig, welcomeMessage: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter welcome message"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Website Content Example</h2>
            <p className="text-gray-600 mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, 
              nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl eget aliquam ultricies,
              nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.
            </p>
            <p className="text-gray-600 mb-4">
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit 
              in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
            <p className="text-gray-600">
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
        </div>
      </div>

      {/* Render the chat widget */}
      {typeof window !== 'undefined' && (
        <ChatWidget 
          clientId={widgetConfig.clientId}
          primaryColor={widgetConfig.primaryColor}
          companyName={widgetConfig.companyName}
          agentName={widgetConfig.agentName}
          welcomeMessage={widgetConfig.welcomeMessage}
        />
      )}
    </>
  );
} 