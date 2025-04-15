import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SuperAdminLayout from '../../../components/metronic/SuperAdminLayout';
import { Client, User } from '@prisma/client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ClientWithAdmins extends Client {
  users: {
    id: string;
    name: string;
    email: string;
  }[];
  _count: {
    agents: number;
  };
}

export default function ClientDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [client, setClient] = useState<ClientWithAdmins | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form state for editing client
  const [formData, setFormData] = useState({
    name: '',
    websiteUrl: '',
    subscriptionStatus: '',
    subscriptionEndDate: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminId: ''
  });
  
  // Fetch client details when ID is available
  useEffect(() => {
    if (id) {
      fetchClientDetails();
    }
  }, [id]);
  
  // Function to fetch client details
  const fetchClientDetails = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/clients/${id}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.message || 'Failed to load client details');
        throw new Error(data.message || 'Failed to fetch client details');
      }
      
      setClient(data);
      
      // Initialize form data with client details
      setFormData({
        name: data.name || '',
        websiteUrl: data.websiteUrl || '',
        subscriptionStatus: data.subscriptionStatus || 'TRIAL',
        subscriptionEndDate: data.subscriptionEndDate 
          ? new Date(data.subscriptionEndDate).toISOString().split('T')[0]
          : '',
        adminName: data.users && data.users[0] ? data.users[0].name : '',
        adminEmail: data.users && data.users[0] ? data.users[0].email : '',
        adminPassword: '',
        adminId: data.users && data.users[0] ? data.users[0].id : ''
      });
    } catch (error) {
      console.error('Error fetching client details:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.message || 'Failed to update client');
        return;
      }
      
      setClient(prev => ({
        ...prev!,
        ...data,
      }));
      
      setIsEditing(false);
      toast.success('Client updated successfully');
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle client deletion
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      setIsDeleting(true);
      
      try {
        const response = await fetch(`/api/clients/${id}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          toast.error(data.message || 'Failed to delete client');
          return;
        }
        
        toast.success('Client deleted successfully');
        router.push('/super-admin/clients');
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('Failed to delete client');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success/20 text-success';
      case 'TRIAL':
        return 'bg-warning/20 text-warning';
      case 'INACTIVE':
      case 'EXPIRED':
        return 'bg-danger/20 text-danger';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };
  
  return (
    <SuperAdminLayout title="Client Details | Super Admin">
      <div className="container mx-auto px-4 py-8">
        <ToastContainer position="top-right" autoClose={3000} />
        
        {/* Back button */}
        <button
          onClick={() => router.push('/super-admin/clients')}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Clients
        </button>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isLoading ? 'Loading Client...' : client ? client.name : 'Client Details'}
          </h1>
          
          {client && !isEditing && (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Edit Client
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Client'
                )}
              </button>
            </div>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <p className="text-red-500">{error}</p>
          </div>
        )}
        
        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : client ? (
          <>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="websiteUrl"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="subscriptionStatus" className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Status
                  </label>
                  <select
                    id="subscriptionStatus"
                    name="subscriptionStatus"
                    value={formData.subscriptionStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="TRIAL">Trial</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="subscriptionEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription End Date
                  </label>
                  <input
                    type="date"
                    id="subscriptionEndDate"
                    name="subscriptionEndDate"
                    value={formData.subscriptionEndDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    id="adminName"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    id="adminEmail"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Admin Password
                  </label>
                  <input
                    type="password"
                    id="adminPassword"
                    name="adminPassword"
                    value={formData.adminPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Leave blank to keep current password"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to keep the current password</p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Client Name</h3>
                    <p className="text-gray-900">{client.name}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Website</h3>
                    <p className="text-gray-900">
                      <a href={client.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {client.websiteUrl}
                      </a>
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Subscription Status</h3>
                    <p className="text-gray-900">{client.subscriptionStatus.replace('_', ' ')}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Subscription End Date</h3>
                    <p className="text-gray-900">
                      {client.subscriptionEndDate 
                        ? new Date(client.subscriptionEndDate).toLocaleDateString() 
                        : 'Not set'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Created At</h3>
                    <p className="text-gray-900">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Number of Agents</h3>
                    <p className="text-gray-900">{client._count.agents}</p>
                  </div>
                </div>
                
                {/* Admin Users */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Users</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {client.users && client.users.length > 0 ? (
                          client.users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{user.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-gray-500">{user.email}</div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                              No admin users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Client not found</p>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
} 