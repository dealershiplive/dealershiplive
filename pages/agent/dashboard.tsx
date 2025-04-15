import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { useSettings } from '../../contexts/SettingsContext';
import AgentLayout from '../../components/metronic/AgentLayout';

interface AgentStats {
  totalChatsToday: number;
  totalCallsToday: number;
  avgResponseTime: number;
  avgCallDuration: number;
  missedChats: number;
  missedCalls: number;
}

interface ActiveConversation {
  id: string;
  customerName: string;
  type: 'chat' | 'call';
  startTime: string;
  status: 'active' | 'waiting';
}

export default function AgentDashboard() {
  const { platformName } = useSettings();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState<AgentStats>({
    totalChatsToday: 0,
    totalCallsToday: 0,
    avgResponseTime: 0,
    avgCallDuration: 0,
    missedChats: 0,
    missedCalls: 0
  });
  const [activeConversations, setActiveConversations] = useState<ActiveConversation[]>([]);
  const [onlineAgents, setOnlineAgents] = useState<{id: string, name: string}[]>([]);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in and has the right role
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'AGENT') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    setIsOnline(parsedUser.isOnline || false);

    // Fetch agent dashboard data
    fetchDashboardData(parsedUser.id, parsedUser.clientId);
    
    // Set up polling for active conversations and online agents
    const intervalId = setInterval(() => {
      fetchActiveConversations(parsedUser.clientId);
      fetchOnlineAgents(parsedUser.clientId);
    }, 30000); // Poll every 30 seconds
    
    // Initial fetch
    fetchActiveConversations(parsedUser.clientId);
    fetchOnlineAgents(parsedUser.clientId);
    
    // Set up inactivity timer
    let inactivityTimer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (isOnline) {
          updateAgentStatus(parsedUser.id, false);
          setIsOnline(false);
          toast.info('You have been set to offline due to inactivity');
        }
      }, 30 * 60 * 1000); // 30 minutes of inactivity
    };

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Initialize the timer
    resetTimer();
    
    return () => {
      clearInterval(intervalId);
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [router, isOnline]);

  const fetchDashboardData = async (agentId: string, clientId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/agent/dashboard?agentId=${agentId}&clientId=${clientId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setStats(data.stats);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setIsLoading(false);
    }
  };

  const fetchActiveConversations = async (clientId: string) => {
    try {
      const response = await fetch(`/api/agent/conversations/active?clientId=${clientId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch active conversations');
      }
      
      const data = await response.json();
      setActiveConversations(data.conversations);
    } catch (error) {
      console.error('Error fetching active conversations:', error);
      toast.error('Failed to fetch active conversations');
    }
  };

  const fetchOnlineAgents = async (clientId: string) => {
    try {
      const response = await fetch(`/api/agent/online?clientId=${clientId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch online agents');
      }
      
      const data = await response.json();
      setOnlineAgents(data.agents);
    } catch (error) {
      console.error('Error fetching online agents:', error);
    }
  };

  const updateAgentStatus = async (agentId: string, status: boolean) => {
    try {
      const response = await fetch('/api/agent/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          agentId,
          isOnline: status 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      setIsOnline(status);
      
      // Update user in localStorage
      const updatedUser = { ...user, isOnline: status };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success(`You are now ${status ? 'online' : 'offline'}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleConversation = (conversation: ActiveConversation) => {
    if (conversation.type.toLowerCase() === 'chat') {
      router.push(`/agent/chat/${conversation.id}`);
    } else {
      router.push(`/agent/call/${conversation.id}`);
    }
  };

  const declineConversation = async (conversationId: string) => {
    try {
      const response = await fetch('/api/agent/conversations/decline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          conversationId,
          agentId: user?.id 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to decline conversation');
      }
      
      // Remove the conversation from the list
      setActiveConversations(prev => 
        prev.filter(conv => conv.id !== conversationId)
      );
      
      toast.success('Conversation declined');
    } catch (error) {
      console.error('Error declining conversation:', error);
      toast.error('Failed to decline conversation');
    }
  };

  return (
    <AgentLayout title="Agent Dashboard">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Agent Dashboard</h1>
            <div className="flex items-center">
              <span className="mr-3 text-sm text-gray-700">Status:</span>
              <button
                onClick={() => updateAgentStatus(user?.id, !isOnline)}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isOnline ? 'bg-green-500' : 'bg-gray-200'
                }`}
              >
                <span className="sr-only">Toggle status</span>
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                    isOnline ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          
          {isLoading ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Chats Today</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalChatsToday}</dd>
                  </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Calls Today</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalCallsToday}</dd>
                  </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg. Response Time</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.avgResponseTime}s</dd>
                  </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg. Call Duration</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.avgCallDuration}m</dd>
                  </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Missed Chats</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.missedChats}</dd>
                  </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Missed Calls</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.missedCalls}</dd>
                  </div>
                </div>
              </div>
              
              {/* Active Conversations */}
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900">Active Conversations</h2>
                <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  {activeConversations.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Customer</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Started</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {activeConversations.map((conversation) => (
                          <tr key={conversation.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{conversation.customerName}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {conversation.type === 'chat' ? 'Chat' : 'Video Call'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {new Date(conversation.startTime).toLocaleTimeString()}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                conversation.status === 'waiting' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {conversation.status === 'waiting' ? 'Waiting' : 'Active'}
                              </span>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              {conversation.status === 'waiting' ? (
                                <div className="flex justify-end space-x-3">
                                  <button
                                    onClick={() => handleConversation(conversation)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => declineConversation(conversation.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Decline
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleConversation(conversation)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Join
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-6 px-4 text-center text-gray-500">
                      No active conversations at the moment.
                    </div>
                  )}
                </div>
              </div>
              
              {/* Online Agents */}
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900">Online Agents</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {onlineAgents.map((agent) => (
                    <div key={agent.id} className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-4 flex items-center">
                        <div className="flex-shrink-0">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500">
                            <span className="text-lg font-medium leading-none text-white">
                              {agent.name.charAt(0)}
                            </span>
                          </span>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
                          <div className="flex items-center">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-400 mr-2"></div>
                            <p className="text-sm text-gray-500">Online</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {onlineAgents.length === 0 && (
                    <div className="col-span-full py-6 px-4 text-center text-gray-500">
                      No other agents are currently online.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AgentLayout>
  );
}