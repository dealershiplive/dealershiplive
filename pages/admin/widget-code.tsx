import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../components/metronic/AdminLayout';
import { useSettings } from '../../contexts/SettingsContext';
import { toast } from 'react-toastify';

export default function WidgetCodePage() {
  const { platformName } = useSettings();
  const [clientId, setClientId] = useState('');
  const [widgetCode, setWidgetCode] = useState('');
  const [widgetConfig, setWidgetConfig] = useState({
    primaryColor: '#4f46e5',
    companyName: '',
    agentName: 'Support Agent',
    welcomeMessage: 'Hello! How can we help you today?'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get client ID from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.clientId) {
        setClientId(parsedUser.clientId);
        fetchWidgetConfig(parsedUser.clientId);
      }
    }
  }, []);

  const fetchWidgetConfig = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clients/${id}/widget-config`);
      if (response.ok) {
        const data = await response.json();
        setWidgetConfig({
          primaryColor: data.widgetColor || '#4f46e5',
          companyName: data.widgetCompanyName || '',
          agentName: data.widgetAgentName || 'Support Agent',
          welcomeMessage: data.widgetWelcomeMessage || 'Hello! How can we help you today?'
        });
        generateWidgetCode(id);
      }
    } catch (error) {
      console.error('Error fetching widget config:', error);
      toast.error('Failed to load widget configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const generateWidgetCode = (id) => {
    const baseUrl = window.location.origin;
    const code = `<script src="${baseUrl}/api/widget/script?clientId=${id}" async></script>`;
    setWidgetCode(code);
  };

  const saveWidgetConfig = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/widget-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          widgetColor: widgetConfig.primaryColor,
          widgetCompanyName: widgetConfig.companyName,
          widgetAgentName: widgetConfig.agentName,
          widgetWelcomeMessage: widgetConfig.welcomeMessage
        }),
      });

      if (response.ok) {
        toast.success('Widget configuration saved successfully');
      } else {
        toast.error('Failed to save widget configuration');
      }
    } catch (error) {
      console.error('Error saving widget config:', error);
      toast.error('Failed to save widget configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(widgetCode)
      .then(() => {
        toast.success('Widget code copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast.error('Failed to copy widget code');
      });
  };

  const openTestPage = () => {
    router.push(`/widget-test?clientId=${clientId}`);
  };

  return (
    <AdminLayout>
      <Head>
        <title>Widget Code | {platformName}</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Widget Configuration</h1>
        
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Customize Your Widget</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={widgetConfig.companyName}
                  onChange={(e) => setWidgetConfig({...widgetConfig, companyName: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Your company name"
                />
              </div>
              
              <div>
                <label htmlFor="agentName" className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Name
                </label>
                <input
                  type="text"
                  id="agentName"
                  value={widgetConfig.agentName}
                  onChange={(e) => setWidgetConfig({...widgetConfig, agentName: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Support Agent"
                />
              </div>
              
              <div>
                <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-1">
                  Welcome Message
                </label>
                <textarea
                  id="welcomeMessage"
                  value={widgetConfig.welcomeMessage}
                  onChange={(e) => setWidgetConfig({...widgetConfig, welcomeMessage: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Hello! How can we help you today?"
                />
              </div>
              
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    id="primaryColor"
                    value={widgetConfig.primaryColor}
                    onChange={(e) => setWidgetConfig({...widgetConfig, primaryColor: e.target.value})}
                    className="h-10 w-10 border border-gray-300 rounded-md mr-2"
                  />
                  <input
                    type="text"
                    value={widgetConfig.primaryColor}
                    onChange={(e) => setWidgetConfig({...widgetConfig, primaryColor: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="#4f46e5"
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={saveWidgetConfig}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
                <button
                  onClick={openTestPage}
                  className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Preview Widget
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Widget Installation Code</h2>
            <p className="text-gray-600 mb-4">
              Copy and paste this code snippet into your website's HTML, just before the closing <code>&lt;/body&gt;</code> tag.
            </p>
            
            <div className="bg-gray-100 p-4 rounded-md mb-4 relative">
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap break-all">
                {widgetCode}
              </pre>
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-1 rounded-md bg-white border border-gray-300 hover:bg-gray-50"
                title="Copy to clipboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>This code will load the chat widget on your website. The widget will appear as a chat button in the bottom right corner of your website.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 