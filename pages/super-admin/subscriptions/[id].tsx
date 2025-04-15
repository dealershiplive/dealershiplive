import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SuperAdminLayout from '../../../components/metronic/SuperAdminLayout';
import { Subscription } from '@prisma/client';
import { toast } from 'react-hot-toast';

interface SubscriptionWithClient extends Subscription {
  client: {
    id: string;
    name: string;
    websiteUrl: string;
  };
}

export default function SubscriptionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [subscription, setSubscription] = useState<SubscriptionWithClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state for editing subscription
  const [formData, setFormData] = useState({
    plan: '',
    status: '',
    startDate: '',
    endDate: '',
    amount: '',
    paymentStatus: ''
  });
  
  // Fetch subscription details when ID is available
  useEffect(() => {
    if (id) {
      fetchSubscriptionDetails();
    }
  }, [id]);
  
  // Function to fetch subscription details
  const fetchSubscriptionDetails = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (!id) return; // Add this check to prevent fetching with undefined id
      
      const response = await fetch(`/api/subscriptions/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch subscription details');
      }
      
      const data = await response.json();
      
      // Check if data and data.client exist before setting the subscription
      if (!data || !data.client) {
        throw new Error('Invalid subscription data received from server');
      }
      
      setSubscription(data);
      setFormData({
        plan: data.plan,
        status: data.status,
        startDate: new Date(data.startDate).toISOString().split('T')[0],
        endDate: new Date(data.endDate).toISOString().split('T')[0],
        amount: data.amount.toString(),
        paymentStatus: data.paymentStatus
      });
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching subscription details');
      console.error('Error fetching subscription details:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update subscription');
      }
      
      const updatedSubscription = await response.json();
      setSubscription(updatedSubscription);
      setIsEditing(false);
      toast.success('Subscription updated successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred while updating the subscription');
    } finally {
      setIsSubmitting(false);
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
  
  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-success/20 text-success';
      case 'FREE':
        return 'bg-info/20 text-info';
      case 'PENDING':
        return 'bg-warning/20 text-warning';
      case 'FAILED':
        return 'bg-danger/20 text-danger';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };
  
  // Handle delete subscription
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this subscription? This action cannot be undone. The client will be set to INACTIVE status.')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete subscription');
      }
      
      toast.success('Subscription deleted successfully and client set to inactive');
      router.push('/super-admin/subscriptions');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while deleting the subscription');
      setIsLoading(false);
    }
  };
  
  return (
    <SuperAdminLayout title={subscription ? `${subscription.plan} Subscription | Super Admin` : 'Subscription Details | Super Admin'}>
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Back button */}
        <div className="mb-6">
          <button 
            onClick={() => router.push('/super-admin/subscriptions')}
            className="flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Subscriptions
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading subscription details...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-danger">{error}</p>
          </div>
        ) : subscription ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {subscription.plan} Subscription
              </h1>
              
              <div className="flex space-x-3">
                {!isEditing && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Edit Subscription
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-danger hover:bg-danger-dark text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {isEditing ? (
              /* Edit Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-1">
                      Plan *
                    </label>
                    <select
                      id="plan"
                      name="plan"
                      value={formData.plan}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="Basic">Basic - 1 Month</option>
                      <option value="Standard">Standard - 6 Months</option>
                      <option value="Premium">Premium - 1 Year</option>
                      <option value="Trial">Trial - 14 Days</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="TRIAL">Trial</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount ($) *
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Status *
                    </label>
                    <select
                      id="paymentStatus"
                      name="paymentStatus"
                      value={formData.paymentStatus}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="FREE">Free</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form data to original values
                      if (subscription) {
                        setFormData({
                          plan: subscription.plan,
                          status: subscription.status,
                          startDate: new Date(subscription.startDate).toISOString().split('T')[0],
                          endDate: new Date(subscription.endDate).toISOString().split('T')[0],
                          amount: subscription.amount.toString(),
                          paymentStatus: subscription.paymentStatus
                        });
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
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
              /* Subscription Details */
              <div className="space-y-8">
                {/* Client Info */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Client Information</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Client Name</h3>
                      <p className="text-lg font-medium text-gray-900">
                        <a href={`/super-admin/clients/${subscription.client.id}`} className="text-primary hover:underline">
                          {subscription.client.name}
                        </a>
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Website</h3>
                      <p className="text-gray-900">
                        <a href={subscription.client.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {subscription.client.websiteUrl}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Subscription Details */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Subscription Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Plan</h3>
                      <p className="text-gray-900">{subscription.plan}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
                      <p className="text-gray-900">{new Date(subscription.startDate).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">End Date</h3>
                      <p className="text-gray-900">{new Date(subscription.endDate).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Amount</h3>
                      <p className="text-gray-900">${subscription.amount.toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Status</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusBadgeClass(subscription.paymentStatus)}`}>
                        {subscription.paymentStatus}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Created At</h3>
                      <p className="text-gray-900">{new Date(subscription.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
                      <p className="text-gray-900">{new Date(subscription.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Subscription not found</p>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
} 