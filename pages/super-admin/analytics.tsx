import { useState, useEffect } from 'react';
import SuperAdminLayout from '../../components/metronic/SuperAdminLayout';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    totalClients: 0,
    activeClients: 0,
    totalAgents: 0,
    activeAgents: 0,
    totalConversations: 0,
    avgResponseTime: 0,
    clientsCreatedByMonth: [],
    topClients: [],
    subscriptionsByPlan: [],
  });
  
  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeRange]);
  
  // Prepare chart data from the fetched data
  const clientGrowthData = {
    labels: analyticsData.clientsCreatedByMonth.map(item => {
      const date = new Date(item.month);
      return date.toLocaleString('default', { month: 'short' });
    }),
    datasets: [
      {
        label: 'New Clients',
        data: analyticsData.clientsCreatedByMonth.map(item => item.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  // Subscription distribution data
  const subscriptionData = {
    labels: analyticsData.subscriptionsByPlan.map(item => item.plan),
    datasets: [
      {
        label: 'Subscriptions',
        data: analyticsData.subscriptionsByPlan.map(item => item._count.id),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Mock data for chat volume (this would need a separate API endpoint with more detailed data)
  const chatVolumeData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Chat Sessions',
        data: [65, 78, 52, 91, 83, 56, 42],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
      },
    ],
  };
  
  // Platform usage by device
  const deviceUsageData = {
    labels: ['Desktop', 'Mobile', 'Tablet'],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Options for charts
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Client Growth Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Chat Volume by Day',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };
  
  return (
    <SuperAdminLayout title="Analytics | Super Admin">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === '7d' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === '30d' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === '90d' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              90 Days
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-primary/10 rounded-lg p-6">
                <h3 className="text-lg font-medium text-primary mb-2">Total Clients</h3>
                <p className="text-3xl font-bold">{analyticsData.totalClients}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {analyticsData.activeClients} active clients
                </p>
              </div>
              
              <div className="bg-success/10 rounded-lg p-6">
                <h3 className="text-lg font-medium text-success mb-2">Active Agents</h3>
                <p className="text-3xl font-bold">{analyticsData.activeAgents}</p>
                <p className="text-sm text-gray-500 mt-2">
                  of {analyticsData.totalAgents} total agents
                </p>
              </div>
              
              <div className="bg-info/10 rounded-lg p-6">
                <h3 className="text-lg font-medium text-info mb-2">Total Conversations</h3>
                <p className="text-3xl font-bold">{analyticsData.totalConversations.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-2">across all clients</p>
              </div>
              
              <div className="bg-warning/10 rounded-lg p-6">
                <h3 className="text-lg font-medium text-warning mb-2">Avg. Response Time</h3>
                <p className="text-3xl font-bold">{analyticsData.avgResponseTime.toFixed(1)}s</p>
                <p className="text-sm text-gray-500 mt-2">platform-wide</p>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Client Growth</h2>
                <div className="h-80">
                  <Line options={lineChartOptions} data={clientGrowthData} />
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Subscription Distribution</h2>
                <div className="h-80">
                  <Doughnut options={doughnutChartOptions} data={subscriptionData} />
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Chat Volume by Day</h2>
                <div className="h-80">
                  <Bar options={barChartOptions} data={chatVolumeData} />
                </div>
              </div>
            </div>
            
            {/* Top Performing Clients */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Top Performing Clients</h2>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chat Sessions
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg. Response Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Satisfaction
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analyticsData.topClients.map((client) => (
                      <tr key={client.client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{client.client.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {client.totalConversations}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {client.avgResponseTime}s
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-success font-medium mr-2">
                              {Math.floor(90 + Math.random() * 10)}%
                            </span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-success h-2 rounded-full" 
                                style={{ width: `${Math.floor(90 + Math.random() * 10)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </SuperAdminLayout>
  );
} 