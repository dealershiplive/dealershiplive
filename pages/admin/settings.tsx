import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import AdminLayout from '../../components/metronic/AdminLayout';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface ClientSettings {
  id: string;
  name: string;
  websiteUrl: string;
  widgetColor: string;
  widgetCompanyName: string | null;
  widgetAgentName: string | null;
  widgetWelcomeMessage: string | null;
}

const AdminSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ClientSettings>();
  const { data: session } = useSession();
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/client-settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        
        const data = await response.json();
        
        // Set form values
        Object.entries(data).forEach(([key, value]) => {
          setValue(key as keyof ClientSettings, value as any);
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [setValue]);
  
  const onSubmit = async (data: ClientSettings) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/client-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to update settings');
      
      toast.success('Settings updated successfully');
      setLoading(false);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Settings</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              className={`px-4 py-3 font-medium ${activeTab === 'general' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button
              className={`px-4 py-3 font-medium ${activeTab === 'widget' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('widget')}
            >
              Widget
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <input type="hidden" {...register('id')} />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Company name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    {...register('websiteUrl', { 
                      required: 'Website URL is required',
                      pattern: {
                        value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                        message: 'Please enter a valid URL'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.websiteUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.websiteUrl.message}</p>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'widget' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Widget Primary Color
                  </label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      {...register('widgetColor')}
                      className="h-10 w-10 rounded border border-gray-300 mr-2"
                    />
                    <input
                      type="text"
                      {...register('widgetColor', { 
                        pattern: {
                          value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
                          message: 'Please enter a valid hex color code'
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  {errors.widgetColor && (
                    <p className="mt-1 text-sm text-red-600">{errors.widgetColor.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Widget Company Name
                  </label>
                  <input
                    type="text"
                    {...register('widgetCompanyName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Default: Your company name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Widget Agent Name
                  </label>
                  <input
                    type="text"
                    {...register('widgetAgentName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Default: Support Agent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Welcome Message
                  </label>
                  <textarea
                    {...register('widgetWelcomeMessage')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Default: Hello! How can we help you today?"
                  ></textarea>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Widget Installation</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Add this script to your website to display the chat widget:
                  </p>
                  <div className="bg-gray-800 text-gray-200 p-3 rounded-md text-sm font-mono overflow-x-auto">
                    {`<script src="${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/api/widget/script?clientId=${session?.user?.clientId}"></script>`}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `<script src="${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/api/widget/script?clientId=${session?.user?.clientId}"></script>`
                      );
                      toast.success('Script copied to clipboard');
                    }}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Copy to clipboard
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage; 