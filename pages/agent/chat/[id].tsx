import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import AgentLayout from '../../../components/metronic/AgentLayout';

interface Message {
  id: string;
  content: string;
  sender: string;
  createdAt: string;
  messageType?: string;
}

export default function AgentChat() {
  const router = useRouter();
  const { id } = router.query;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [customerName, setCustomerName] = useState('Customer');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [showEndChatConfirm, setShowEndChatConfirm] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [showVideoConfirm, setShowVideoConfirm] = useState(false);

  // Fetch conversation details and messages
  useEffect(() => {
    if (!id) return;

    const fetchConversation = async () => {
      try {
        const response = await fetch(`/api/conversations/${id}`);
        if (!response.ok) throw new Error('Failed to fetch conversation');
        
        const data = await response.json();
        setCustomerName(data.conversation.customerName || 'Customer');
        
        // Update conversation status to ACTIVE if it's WAITING
        if (data.conversation.status === 'WAITING') {
          await fetch(`/api/conversations/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'ACTIVE' })
          });
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
        toast.error('Failed to load conversation');
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/conversations/${id}/messages`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        
        const data = await response.json();
        setMessages(data.messages);
        
        const hasVideoRequest = data.messages.some(
          msg => msg.messageType === 'VIDEO_REQUEST' && msg.sender === 'customer'
        );
        
        if (hasVideoRequest && !showVideoConfirm) {
          setShowVideoConfirm(true);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
        setIsLoading(false);
      }
    };

    fetchConversation();
    fetchMessages();

    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 3000);
    setPollingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleEndChat = async () => {
    try {
      const response = await fetch(`/api/conversations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ENDED' })
      });

      if (!response.ok) {
        throw new Error('Failed to end conversation');
      }

      // Clear polling interval
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }

      // Add system message that chat has ended
      const endMessage = {
        id: Date.now().toString(),
        content: 'This conversation has been ended by the agent.',
        sender: 'system',
        createdAt: new Date().toISOString()
      };
      
      setMessages([...messages, endMessage]);
      setChatEnded(true);
      setShowEndChatConfirm(false);
      
      toast.success('Conversation ended successfully');
      
      // Redirect back to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/agent/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Error ending conversation:', error);
      toast.error('Failed to end conversation');
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || !id || chatEnded) return;

    try {
      const response = await fetch(`/api/conversations/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: inputValue,
          sender: 'agent'
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      setInputValue('');
      
      // Refresh messages
      const messagesResponse = await fetch(`/api/conversations/${id}/messages`);
      const data = await messagesResponse.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleVideoResponse = async (accept: boolean) => {
    try {
      const response = await fetch(`/api/conversations/${id}/video-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accepted: accept,
          senderId: 'agent',
          senderRole: 'AGENT'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to respond to video request');
      }
      
      const newMessage = {
        id: Date.now().toString(),
        content: accept ? 'Video call accepted' : 'Video call declined',
        sender: 'agent',
        createdAt: new Date().toISOString(),
        messageType: accept ? 'VIDEO_ACCEPTED' : 'VIDEO_DECLINED'
      };
      
      setMessages([...messages, newMessage]);
      setShowVideoConfirm(false);
      
      if (accept) {
        toast.success('Video call accepted - Video functionality coming soon!');
      }
    } catch (error) {
      console.error('Error responding to video request:', error);
      toast.error('Failed to respond to video request');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AgentLayout>
      <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
        {/* Chat header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">{customerName}</h2>
            <p className="text-sm text-gray-500">Chat conversation</p>
          </div>
          <div className="flex items-center space-x-2">
            {!chatEnded && (
              <button
                onClick={() => setShowEndChatConfirm(true)}
                className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
              >
                End Chat
              </button>
            )}
            <button
              onClick={() => router.push('/agent/dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* End Chat Confirmation Dialog */}
        {showEndChatConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">End Conversation</h3>
              <p className="text-gray-600 mb-4">Are you sure you want to end this conversation? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEndChatConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndChat}
                  className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700"
                >
                  End Chat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Video Call Confirmation Dialog */}
        {showVideoConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Incoming Video Call</h3>
              <p className="text-gray-600 mb-4">The customer is requesting a video call. Would you like to accept?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleVideoResponse(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleVideoResponse(true)}
                  className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No messages yet</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${
                  message.sender === 'agent' 
                    ? 'justify-end' 
                    : message.sender === 'system' 
                      ? 'justify-center' 
                      : 'justify-start'
                }`}
              >
                {message.sender === 'system' ? (
                  <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-[75%]">
                    {message.content}
                  </div>
                ) : (
                  <div className={`max-w-[75%] ${message.sender === 'agent' ? 'order-1' : 'order-2'}`}>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.sender === 'agent'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {message.messageType === 'VIDEO_REQUEST' && (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Video call requested</span>
                        </div>
                      )}
                      {message.messageType === 'VIDEO_ACCEPTED' && (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Video call accepted</span>
                        </div>
                      )}
                      {message.messageType === 'VIDEO_DECLINED' && (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Video call declined</span>
                        </div>
                      )}
                      {(!message.messageType || message.messageType === 'TEXT') && (
                        <span>{message.content}</span>
                      )}
                    </div>
                    <div className={`text-xs text-gray-500 mt-1 ${message.sender === 'agent' ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-gray-200">
          {chatEnded ? (
            <div className="text-center text-gray-500 py-2">
              This conversation has ended
            </div>
          ) : (
            <div className="flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                disabled={chatEnded}
              />
              <button
                onClick={handleSendMessage}
                className="p-2 rounded-r-md text-white bg-blue-600 hover:bg-blue-700"
                disabled={chatEnded}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </AgentLayout>
  );
}