import { useState, useEffect } from 'react';
import SuperAdminLayout from '../../components/metronic/SuperAdminLayout';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SettingsPage() {
  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'SaaS Support Platform',
    supportEmail: 'support@example.com',
    defaultLanguage: 'en',
    maintenanceMode: false,
  });
  
  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    passwordRequireSpecialChar: true,
    passwordRequireNumber: true,
    passwordRequireUppercase: true,
    twoFactorAuthRequired: false,
    sessionTimeout: 60, // minutes
  });
  
  // API Keys
  const [apiKeys, setApiKeys] = useState({
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioApiKey: '',
    twilioApiSecret: '',
    stripePublishableKey: '',
    stripeSecretKey: '',
  });
  
  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    emailFromName: '',
    emailFromAddress: '',
  });
  
  // Add loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneralSubmitting, setIsGeneralSubmitting] = useState(false);
  const [isSecuritySubmitting, setIsSecuritySubmitting] = useState(false);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [isApiKeysSubmitting, setIsApiKeysSubmitting] = useState(false);
  
  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/settings');
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        
        const data = await response.json();
        
        // Update all settings states
        setGeneralSettings({
          platformName: data.platformName || 'SaaS Support Platform',
          supportEmail: data.supportEmail || 'support@example.com',
          defaultLanguage: data.defaultLanguage || 'en',
          maintenanceMode: data.maintenanceMode || false,
        });
        
        setSecuritySettings({
          passwordMinLength: data.passwordMinLength || 8,
          passwordRequireSpecialChar: data.passwordRequireSpecialChar || true,
          passwordRequireNumber: data.passwordRequireNumber || true,
          passwordRequireUppercase: data.passwordRequireUppercase || true,
          twoFactorAuthRequired: data.twoFactorAuthRequired || false,
          sessionTimeout: data.sessionTimeout || 60,
        });
        
        setApiKeys({
          twilioAccountSid: data.twilioAccountSid || '',
          twilioAuthToken: data.twilioAuthToken || '',
          twilioApiKey: data.twilioApiKey || '',
          twilioApiSecret: data.twilioApiSecret || '',
          stripePublishableKey: data.stripePublishableKey || '',
          stripeSecretKey: data.stripeSecretKey || '',
        });
        
        setEmailSettings({
          smtpHost: data.smtpHost || '',
          smtpPort: data.smtpPort || 587,
          smtpUsername: data.smtpUsername || '',
          smtpPassword: data.smtpPassword || '',
          emailFromName: data.emailFromName || '',
          emailFromAddress: data.emailFromAddress || '',
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  // Handle form input changes
  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  
  const handleSecuritySettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' ? parseInt(value) : value,
    }));
  };
  
  const handleApiKeysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiKeys(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleEmailSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };
  
  // Handle form submissions
  const handleGeneralSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneralSubmitting(true);
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: 'General',
          ...generalSettings,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save general settings');
      }
      
      toast.success('General settings saved successfully!');
    } catch (error) {
      console.error('Error saving general settings:', error);
      toast.error('Failed to save general settings');
    } finally {
      setIsGeneralSubmitting(false);
    }
  };
  
  const handleSecuritySettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSecuritySubmitting(true);
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: 'Security',
          ...securitySettings,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save security settings');
      }
      
      toast.success('Security settings saved successfully!');
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast.error('Failed to save security settings');
    } finally {
      setIsSecuritySubmitting(false);
    }
  };
  
  const handleEmailSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailSubmitting(true);
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: 'Email',
          ...emailSettings,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save email settings');
      }
      
      toast.success('Email settings saved successfully!');
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast.error('Failed to save email settings');
    } finally {
      setIsEmailSubmitting(false);
    }
  };
  
  const handleApiKeysSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApiKeysSubmitting(true);
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: 'API Keys',
          ...apiKeys,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save API keys');
      }
      
      toast.success('API keys saved successfully!');
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast.error('Failed to save API keys');
    } finally {
      setIsApiKeysSubmitting(false);
    }
  };
  
  // Rest of your component remains the same...
  return (
    <SuperAdminLayout title="Settings | Super Admin">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Settings</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* General Settings */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">General Settings</h2>
              <form onSubmit={handleGeneralSettingsSubmit} className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="platformName" className="block text-sm font-medium text-gray-700 mb-1">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      id="platformName"
                      name="platformName"
                      value={generalSettings.platformName}
                      onChange={handleGeneralSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      id="supportEmail"
                      name="supportEmail"
                      value={generalSettings.supportEmail}
                      onChange={handleGeneralSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="defaultLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                      Default Language
                    </label>
                    <select
                      id="defaultLanguage"
                      name="defaultLanguage"
                      value={generalSettings.defaultLanguage}
                      onChange={handleGeneralSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center h-full">
                    <input
                      type="checkbox"
                      id="maintenanceMode"
                      name="maintenanceMode"
                      checked={generalSettings.maintenanceMode}
                      onChange={handleGeneralSettingsChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
                      Enable Maintenance Mode
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                    disabled={isGeneralSubmitting}
                  >
                    {isGeneralSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save General Settings'
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Security Settings */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Security Settings</h2>
              <form onSubmit={handleSecuritySettingsSubmit} className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="passwordMinLength" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Password Length
                    </label>
                    <input
                      type="number"
                      id="passwordMinLength"
                      name="passwordMinLength"
                      value={securitySettings.passwordMinLength}
                      onChange={handleSecuritySettingsChange}
                      min="6"
                      max="32"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-1">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      id="sessionTimeout"
                      name="sessionTimeout"
                      value={securitySettings.sessionTimeout}
                      onChange={handleSecuritySettingsChange}
                      min="15"
                      max="1440"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="passwordRequireSpecialChar"
                      name="passwordRequireSpecialChar"
                      checked={securitySettings.passwordRequireSpecialChar}
                      onChange={handleSecuritySettingsChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="passwordRequireSpecialChar" className="ml-2 block text-sm text-gray-700">
                      Require Special Character
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="passwordRequireNumber"
                      name="passwordRequireNumber"
                      checked={securitySettings.passwordRequireNumber}
                      onChange={handleSecuritySettingsChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="passwordRequireNumber" className="ml-2 block text-sm text-gray-700">
                      Require Number
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="passwordRequireUppercase"
                      name="passwordRequireUppercase"
                      checked={securitySettings.passwordRequireUppercase}
                      onChange={handleSecuritySettingsChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="passwordRequireUppercase" className="ml-2 block text-sm text-gray-700">
                      Require Uppercase Letter
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="twoFactorAuthRequired"
                      name="twoFactorAuthRequired"
                      checked={securitySettings.twoFactorAuthRequired}
                      onChange={handleSecuritySettingsChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="twoFactorAuthRequired" className="ml-2 block text-sm text-gray-700">
                      Require Two-Factor Authentication
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                    disabled={isSecuritySubmitting}
                  >
                    {isSecuritySubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Security Settings'
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* API Keys */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">API Keys & Integrations</h2>
              <form onSubmit={handleApiKeysSubmit} className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Twilio (Video & Voice)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="twilioAccountSid" className="block text-sm font-medium text-gray-700 mb-1">
                          Account SID
                        </label>
                        <input
                          type="text"
                          id="twilioAccountSid"
                          name="twilioAccountSid"
                          value={apiKeys.twilioAccountSid}
                          onChange={handleApiKeysChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="twilioAuthToken" className="block text-sm font-medium text-gray-700 mb-1">
                          Auth Token
                        </label>
                        <input
                          type="password"
                          id="twilioAuthToken"
                          name="twilioAuthToken"
                          value={apiKeys.twilioAuthToken}
                          onChange={handleApiKeysChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="twilioApiKey" className="block text-sm font-medium text-gray-700 mb-1">
                          API Key
                        </label>
                        <input
                          type="text"
                          id="twilioApiKey"
                          name="twilioApiKey"
                          value={apiKeys.twilioApiKey}
                          onChange={handleApiKeysChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="twilioApiSecret" className="block text-sm font-medium text-gray-700 mb-1">
                          API Secret
                        </label>
                        <input
                          type="password"
                          id="twilioApiSecret"
                          name="twilioApiSecret"
                          value={apiKeys.twilioApiSecret}
                          onChange={handleApiKeysChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Stripe (Payments)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="stripePublishableKey" className="block text-sm font-medium text-gray-700 mb-1">
                          Publishable Key
                        </label>
                        <input
                          type="text"
                          id="stripePublishableKey"
                          name="stripePublishableKey"
                          value={apiKeys.stripePublishableKey}
                          onChange={handleApiKeysChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="stripeSecretKey" className="block text-sm font-medium text-gray-700 mb-1">
                          Secret Key
                        </label>
                        <input
                          type="password"
                          id="stripeSecretKey"
                          name="stripeSecretKey"
                          value={apiKeys.stripeSecretKey}
                          onChange={handleApiKeysChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                    disabled={isApiKeysSubmitting}
                  >
                    {isApiKeysSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save API Keys'
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Email Settings */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Email Settings</h2>
              <form onSubmit={handleEmailSettingsSubmit} className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      id="smtpHost"
                      name="smtpHost"
                      value={emailSettings.smtpHost}
                      onChange={handleEmailSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="smtp.example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      id="smtpPort"
                      name="smtpPort"
                      value={emailSettings.smtpPort}
                      onChange={handleEmailSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="587"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      id="smtpUsername"
                      name="smtpUsername"
                      value={emailSettings.smtpUsername}
                      onChange={handleEmailSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="username@example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      id="smtpPassword"
                      name="smtpPassword"
                      value={emailSettings.smtpPassword}
                      onChange={handleEmailSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="emailFromName" className="block text-sm font-medium text-gray-700 mb-1">
                      From Name
                    </label>
                    <input
                      type="text"
                      id="emailFromName"
                      name="emailFromName"
                      value={emailSettings.emailFromName}
                      onChange={handleEmailSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Support Team"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="emailFromAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      From Email Address
                    </label>
                    <input
                      type="email"
                      id="emailFromAddress"
                      name="emailFromAddress"
                      value={emailSettings.emailFromAddress}
                      onChange={handleEmailSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="noreply@example.com"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                    disabled={isEmailSubmitting}
                  >
                    {isEmailSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Email Settings'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}