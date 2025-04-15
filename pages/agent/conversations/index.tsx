import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import AgentLayout from '../../../components/metronic/AgentLayout';
import { format } from 'date-fns';

interface Conversation {
  id: string;
  customerName: string;
  customerEmail: string | null;
  status: string;
  type: string;
  createdAt: string;
  endedAt: string | null;
  lastActiveAt: string | null;
  lastMessage: string | null;
  lastMessageTime: string | null;
}

export default function AgentConversations() {
  const router = useRouter();
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    // Try to get clientId from session or localStorage
    const getClientId = () => {
      if (session?.user?.clientId) {
        return session.user.clientId;
      }
      
      // Try to get from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.clientId) {
            return userData.clientId;
          }
        } catch (e) {
          console.error('Error parsing user data from localStorage:', e);
        }
      }
      
      return null;
    };
    
    const cId = getClientId();
    setClientId(cId);
    
    if (cId) {
      fetchConversations(cId);
    } else {
      setIsLoading(false);
    }
  }, [session]);
  
  const fetchConversations = async (cId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/agent/conversations/all?clientId=${cId}`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json();
      console.log('Fetched conversations:', data);
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    if (activeTab === 'active') {
      return ['ACTIVE', 'IN_PROGRESS'].includes(conversation.status);
    } else if (activeTab === 'ended') {
      return conversation.status === 'ENDED';
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleConversationClick = (id: string) => {
    router.push(`/agent/chat/${id}`);
  };

  return (
    <AgentLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Conversations</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all your conversations with customers.
            </p>
          </div>
        </div>

        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('active')}
              className={`${
                activeTab === 'active'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('ended')}
              className={`${
                activeTab === 'ended'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Ended
            </button>
          </nav>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'active' 
                ? "You don't have any active conversations at the moment." 
                : "You don't have any ended conversations."}
            </p>
          </div>
        ) : (
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Customer
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Type
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Last Message
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Started
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredConversations.map((conversation) => (
                        <tr 
                          key={conversation.id} 
                          onClick={() => handleConversationClick(conversation.id)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 font-medium">
                                  {conversation.customerName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">{conversation.customerName}</div>
                                <div className="text-gray-500">{conversation.customerEmail || 'No email'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              conversation.type === 'CHAT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {conversation.type}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="max-w-xs truncate">
                              {conversation.lastMessage || 'No messages yet'}
                            </div>
                            {conversation.lastMessageTime && (
                              <div className="text-xs text-gray-400">
                                {formatDate(conversation.lastMessageTime)}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(conversation.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              conversation.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                              conversation.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 
                              conversation.status === 'ENDED' ? 'bg-gray-100 text-gray-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {conversation.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AgentLayout>
  );
} 