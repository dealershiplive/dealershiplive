import SuperAdminLayout from '../../components/metronic/SuperAdminLayout';

export default function SuperAdminDashboard() {
  return (
    <SuperAdminLayout title="Dashboard | Super Admin">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-primary/10 rounded-lg p-6">
            <h3 className="text-lg font-medium text-primary mb-2">Total Clients</h3>
            <p className="text-3xl font-bold">12</p>
          </div>
          
          <div className="bg-success/10 rounded-lg p-6">
            <h3 className="text-lg font-medium text-success mb-2">Active Subscriptions</h3>
            <p className="text-3xl font-bold">10</p>
          </div>
          
          <div className="bg-warning/10 rounded-lg p-6">
            <h3 className="text-lg font-medium text-warning mb-2">Expiring Soon</h3>
            <p className="text-3xl font-bold">2</p>
          </div>
          
          <div className="bg-info/10 rounded-lg p-6">
            <h3 className="text-lg font-medium text-info mb-2">Active Agents</h3>
            <p className="text-3xl font-bold">25</p>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">New client registered</p>
                  <p className="text-sm text-gray-500">Tech Solutions Inc.</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-success/20 flex items-center justify-center text-success">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Subscription renewed</p>
                  <p className="text-sm text-gray-500">Global Retail Co.</p>
                  <p className="text-xs text-gray-400">5 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-warning/20 flex items-center justify-center text-warning">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Subscription expiring soon</p>
                  <p className="text-sm text-gray-500">Acme Corp</p>
                  <p className="text-xs text-gray-400">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* System Status */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Server Health</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                    <span className="text-sm font-medium text-gray-700">28%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                    <span className="text-sm font-medium text-gray-700">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-warning h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Storage</span>
                    <span className="text-sm font-medium text-gray-700">62%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">API Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Twilio Video API</span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-success/20 text-success">Operational</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">WebRTC Service</span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-success/20 text-success">Operational</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Payment Gateway</span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-success/20 text-success">Operational</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Email Service</span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning/20 text-warning">Degraded</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
} 