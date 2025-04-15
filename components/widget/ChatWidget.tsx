import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWidgetProps {
  clientId: string;
  primaryColor?: string;
  secondaryColor?: string;
  position?: 'right' | 'left';
  welcomeMessage?: string;
  companyName?: string;
  agentName?: string;
  logoUrl?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  clientId,
  primaryColor: initialPrimaryColor = '#4f46e5',
  secondaryColor: initialSecondaryColor = '#ffffff',
  position = 'right',
  welcomeMessage: initialWelcomeMessage = 'Hello! How can we help you today?',
  companyName: initialCompanyName = 'Support',
  agentName: initialAgentName = 'Support Agent',
  logoUrl,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: initialWelcomeMessage,
      sender: 'agent',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showPreChat, setShowPreChat] = useState(true);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
  });
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentAgentName, setCurrentAgentName] = useState(initialAgentName);
  const [showEndChatConfirm, setShowEndChatConfirm] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);

  // Convert props to state variables so we can update them
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(initialSecondaryColor);
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [welcomeMessage, setWelcomeMessage] = useState(initialWelcomeMessage);

  // Add these new refs and state variables
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  // Also add this state variable if it doesn't exist
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<number | null>(null);

  // Fetch client configuration when the widget loads
  useEffect(() => {
    const fetchClientConfig = async () => {
      try {
        const response = await fetch(`/api/clients/${clientId}/widget-config-customer`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch client configuration');
        }
        
        const config = await response.json();
        
        // Update widget settings with client configuration
        if (config.widgetColor) {
          setPrimaryColor(config.widgetColor);
          // Calculate a lighter version for secondary color
        }
        
        if (config.widgetCompanyName) {
          setCompanyName(config.widgetCompanyName);
        }
        
        if (config.widgetAgentName) {
          setCurrentAgentName(config.widgetAgentName);
        }
        
        // Note: We don't update the welcome message here as it's handled in create.ts
      } catch (error) {
        console.error('Error fetching client configuration:', error);
        // Continue with default values if fetch fails
      }
    };
    
    if (clientId) {
      fetchClientConfig();
    }
  }, [clientId]);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Handle clicks outside the widget to close it on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && isMobile && widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Add this useEffect to load conversation data on initial render
  useEffect(() => {
    const storedConversationId = localStorage.getItem(`chat_${clientId}_conversationId`);
    
    if (storedConversationId) {
      // Check if the conversation exists and is not ended
      fetch(`/api/conversations/${storedConversationId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Conversation not found or invalid');
          }
          return response.json();
        })
        .then(data => {
          if (data.status === 'ENDED') {
            // If conversation has ended, reset the chat
            localStorage.removeItem(`chat_${clientId}_conversationId`);
            return;
          }
          
          // Restore the conversation
          setConversationId(storedConversationId);
          setShowPreChat(false);
          
          // Load customer info
          if (data.customerName || data.customerEmail) {
            setUserInfo({
              name: data.customerName || '',
              email: data.customerEmail || ''
            });
          }
          
          // Load messages
          if (data.messages && data.messages.length > 0) {
            const formattedMessages = data.messages.map((msg: any) => ({
              id: msg.id,
              text: msg.content,
              sender: msg.sender === 'agent' ? 'agent' : 'user',
              timestamp: new Date(msg.createdAt)
            }));
            
            // Ensure we don't have duplicate welcome message
            const hasWelcomeMessage = formattedMessages.some(msg => 
              msg.text === initialWelcomeMessage && msg.sender === 'agent'
            );
            
            setMessages(
              hasWelcomeMessage 
                ? formattedMessages 
                : [
                    // Add welcome message only if it doesn't exist
                    {
                      id: 'welcome-' + Date.now(),
                      text: initialWelcomeMessage,
                      sender: 'agent',
                      timestamp: new Date(),
                    },
                    ...formattedMessages
                  ]
            );
            
            // Start polling for new messages
            startPollingForMessages(storedConversationId);
          }
        })
        .catch(error => {
          console.error('Error loading conversation:', error);
          // If there's an error, remove the stored conversation ID
          localStorage.removeItem(`chat_${clientId}_conversationId`);
        });
    }
  }, [clientId, initialWelcomeMessage]);

  // Simplified polling for messages only
  useEffect(() => {
    if (conversationId && !showPreChat && !chatEnded) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`/api/conversations/${conversationId}/messages`);
          
          if (!response.ok) {
            console.error('Error response from messages API:', response.status);
            return;
          }
          
          const data = await response.json();
          
          // Format messages for our UI
          const formattedMessages = data.messages.map((msg: any) => ({
            id: msg.id,
            text: msg.content,
            sender: msg.sender === 'agent' ? 'agent' : 'user',
            timestamp: new Date(msg.createdAt)
          }));
          
          setMessages(formattedMessages);
          
          // Check if conversation has ended
          const statusResponse = await fetch(`/api/conversations/${conversationId}`);
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            if (statusData.conversation.status === 'ENDED') {
              handleConversationEnded(formattedMessages);
            }
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      // Initial fetch
      fetchMessages();
      
      // Set up polling
      const interval = setInterval(fetchMessages, 3000);
      setPollingInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [conversationId, showPreChat, chatEnded]);

  // Send heartbeat to keep conversation active
  useEffect(() => {
    if (conversationId && !showPreChat && !chatEnded) {
      const sendHeartbeat = async () => {
        try {
          await fetch(`/api/conversations/${conversationId}/heartbeat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
        } catch (error) {
          console.error('Error sending heartbeat:', error);
        }
      };

      // Initial heartbeat
      sendHeartbeat();
      
      // Set up heartbeat interval (every 30 seconds)
      const heartbeatInterval = setInterval(sendHeartbeat, 30000);
      
      // Handle page unload/close
      const handleBeforeUnload = () => {
        fetch(`/api/conversations/${conversationId}/inactive`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Using keepalive to ensure the request completes even if the page is closing
          keepalive: true
        }).catch(err => console.error('Error marking conversation as inactive:', err));
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        clearInterval(heartbeatInterval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [conversationId, showPreChat, chatEnded]);

  // Handle when a conversation is ended (either by agent or user)
  const handleConversationEnded = (currentMessages: Message[]) => {
    // Add system message that chat has ended
    const endMessage = {
      id: Date.now().toString(),
      text: 'This conversation has ended.',
      sender: 'agent' as const,
      timestamp: new Date(),
    };
    
    setMessages([...currentMessages, endMessage]);
    setChatEnded(true);
    
    // Clear polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    // After 5 seconds, reset the chat widget to pre-chat state
    setTimeout(() => {
      setShowPreChat(true);
      setConversationId(null);
      setMessages([
        {
          id: '1',
          text: initialWelcomeMessage,
          sender: 'agent',
          timestamp: new Date(),
        },
      ]);
      setUserInfo({ name: '', email: '' });
      setChatEnded(false);
    }, 5000);
  };

  // Simplified start conversation function
  const startConversation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          customerName: userInfo.name,
          customerEmail: userInfo.email,
          initialMessage: welcomeMessage
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }
  
      const data = await response.json();
      setConversationId(data.conversationId);
      setShowPreChat(false);
      
      // Add the welcome message to the chat
      setMessages([
        {
          id: 'welcome',
          content: welcomeMessage,
          sender: 'agent',
          timestamp: new Date(),
        },
      ]);
      
      // Start the heartbeat to keep the conversation active
      const interval = setInterval(() => {
        fetch(`/api/conversations/${data.conversationId}/heartbeat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch(err => console.error('Heartbeat error:', err));
      }, 30000); // Every 30 seconds
      
      setPollingInterval(interval);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect to support. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update handleSendMessage to store conversationId
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!inputValue.trim() || !conversationId || chatEnded) {
      return;
    }

    const newMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user' as const,
      timestamp: new Date(),
    };

    // Optimistically add message to UI
    setMessages([...messages, newMessage]);
    setInputValue('');

    try {
      // Send message to API
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.text,
          sender: 'customer'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleStartVideoCall = async () => {
    try {
      // First, send a video call request to the agent
      if (!conversationId) {
        throw new Error('No active conversation');
      }
      
      // Send video request message
      const requestResponse = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: 'Video call requested',
          sender: 'customer',
          messageType: 'VIDEO_REQUEST'
        }),
      });

      if (!requestResponse.ok) {
        throw new Error('Failed to send video call request');
      }
      
      // Add video request message to local messages
      const videoRequestMessage = {
        id: Date.now().toString(),
        text: 'Video call requested',
        sender: 'user' as const,
        timestamp: new Date(),
        messageType: 'VIDEO_REQUEST'
      };
      
      setMessages([...messages, videoRequestMessage]);
      
      // Now start the video call UI
      setIsVideoCallActive(true);
      setIsConnecting(true);
      
      // Request access to camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setLocalStream(stream);
      
      // Display local video stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Simulate connection delay (in a real app, this would be when you connect to the other party)
      setTimeout(() => {
        setIsConnecting(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error starting video call:', error);
      alert('Could not start video call. Please try again.');
      setIsVideoCallActive(false);
    }
  };

  const handleEndVideoCall = () => {
    // Stop all tracks in the local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    setIsVideoCallActive(false);
    setIsMicMuted(false);
    setIsVideoOff(false);
  };
  
  // Add these new functions
  const toggleMicrophone = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicMuted(!isMicMuted);
    }
  };
  
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Add this useEffect to clean up media streams when component unmounts
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  // Update handlePreChatSubmit to store conversationId
  const handlePreChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInfo.name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          customerName: userInfo.name,
          customerEmail: userInfo.email,
          initialMessage: inputValue || null
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start conversation');
      }
      
      const data = await response.json();
      const newConversationId = data.conversationId;
      
      setConversationId(newConversationId);
      // Store conversation ID in localStorage
      localStorage.setItem(`chat_${clientId}_conversationId`, newConversationId);
      
      // Clear the pre-chat form and show the chat interface
      setShowPreChat(false);
      
      // Only add the message to the UI if there was an actual input value
      if (inputValue) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
          }
        ]);
        setInputValue('');
      }
      
      // Start polling for new messages
      startPollingForMessages(newConversationId);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Update handleEndChat to remove conversationId from localStorage
  const handleEndChat = async () => {
    if (!conversationId) return;
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'ENDED'
        }),
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
        text: 'This conversation has ended. Thank you for chatting with us!',
        sender: 'agent' as const,
        timestamp: new Date(),
      };
      
      setMessages([...messages, endMessage]);
      setChatEnded(true);
      setShowEndChatConfirm(false);
      
      // Remove conversation ID from localStorage
      localStorage.removeItem(`chat_${clientId}_conversationId`);
      
      // After 5 seconds, reset the chat widget to pre-chat state
      setTimeout(() => {
        setShowPreChat(true);
        setConversationId(null);
        setMessages([
          {
            id: '1',
            text: initialWelcomeMessage,
            sender: 'agent',
            timestamp: new Date(),
          },
        ]);
        setUserInfo({ name: '', email: '' });
        setChatEnded(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error ending conversation:', error);
      setError('Failed to end the conversation. Please try again.');
    }
  };

  // Add this function to poll for new messages
  const startPollingForMessages = (convId: string) => {
    // Clear any existing polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    // Set up a new polling interval
    const interval = setInterval(async () => {
      try {
        // Use the last message timestamp to only fetch new messages
        const timestamp = lastMessageTimestamp ? 
          `?since=${lastMessageTimestamp}` : '';
        
        const response = await fetch(`/api/conversations/${convId}/messages${timestamp}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const data = await response.json();
        
        if (data.messages && data.messages.length > 0) {
          // Format incoming messages
          const newMessages = data.messages.map((msg: any) => ({
            id: msg.id,
            text: msg.content,
            sender: msg.sender === 'agent' ? 'agent' : 'user',
            timestamp: new Date(msg.createdAt)
          }));
          
          // Update messages state, ensuring no duplicate IDs
          setMessages(prevMessages => {
            // Create a map of existing message IDs for quick lookup
            const existingIds = new Set(prevMessages.map(msg => msg.id));
            
            // Filter out any new messages that already exist in the current messages
            const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
            
            // Only update if there are actually new messages
            if (uniqueNewMessages.length > 0) {
              return [...prevMessages, ...uniqueNewMessages];
            }
            
            return prevMessages;
          });
          
          // Update last message timestamp
          if (data.messages.length > 0) {
            const lastMsg = data.messages[data.messages.length - 1];
            setLastMessageTimestamp(new Date(lastMsg.createdAt).getTime());
          }
        }
        
        // Check if conversation has ended
        if (data.status === 'ENDED') {
          setChatEnded(true);
          clearInterval(interval);
          setPollingInterval(null);
        }
      } catch (error) {
        console.error('Error polling for messages:', error);
      }
    }, 3000); // Poll every 3 seconds
    
    setPollingInterval(interval);
  };

  return (
    <div 
      className={`fixed ${position === 'right' ? 'right-4' : 'left-4'} bottom-4 z-50 flex flex-col items-end`}
      ref={widgetRef}
    >
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`mb-4 rounded-lg shadow-xl overflow-hidden flex flex-col ${
              isMobile || isFullScreen
                ? 'fixed top-0 left-0 right-0 bottom-0 m-0 rounded-none z-50' 
                : 'w-[400px] h-[650px]'
            }`}
            style={{ backgroundColor: secondaryColor }}
          >
            {/* Header with improved video call button */}
            <div 
              className="p-4 flex justify-between items-center"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center">
                {logoUrl ? (
                  <img src={logoUrl} alt={companyName} className="w-8 h-8 rounded-full mr-2" />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-opacity-80"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                )}
                <div className="ml-2 text-white">
                  <div className="font-medium">{companyName}</div>
                  <div className="text-xs opacity-80">
                    {!showPreChat && !isVideoCallActive ? `Chatting with ${currentAgentName}` : 'Live Support'}
                  </div>
                </div>
              </div>
              <div className="flex">
                {!isVideoCallActive && !showPreChat && (
                  <button 
                    onClick={handleStartVideoCall}
                    className="mr-2 p-2 rounded-full bg-opacity-20 bg-white text-white hover:bg-opacity-30 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                )}
                {!isMobile && (
                  <button 
                    onClick={toggleFullScreen}
                    className="mr-2 p-2 rounded-full bg-opacity-20 bg-white text-white hover:bg-opacity-30 transition-colors"
                  >
                    {isFullScreen ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                      </svg>
                    )}
                  </button>
                )}
                <button 
                  onClick={toggleWidget}
                  className="p-2 rounded-full bg-opacity-20 bg-white text-white hover:bg-opacity-30 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Main content */}
            {isVideoCallActive ? (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 bg-black relative">
                  {/* Video call placeholder - will be replaced with actual Twilio Video */}
                  {isConnecting ? (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="animate-pulse mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-lg font-medium">Connecting to video call...</p>
                        <p className="text-sm opacity-75 mt-2">Please wait while we connect you with {currentAgentName}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Remote video (agent) - would be connected in a real implementation */}
                      <video 
                        ref={remoteVideoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay
                        playsInline
                      ></video>
                      
                      {/* Placeholder for when no remote video is available */}
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="text-center">
                          <div className="h-24 w-24 rounded-full bg-gray-700 mx-auto mb-4 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <p className="text-lg font-medium">Waiting for {currentAgentName} to join...</p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Small self-view */}
                  <div className="absolute bottom-4 right-4 w-32 h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
                    <video 
                      ref={localVideoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted // Always mute local video to prevent feedback
                    ></video>
                    
                    {/* Show camera off indicator if video is disabled */}
                    {isVideoOff && (
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Video call controls */}
                <div className="p-4 bg-gray-900 flex justify-center space-x-4">
                  <button 
                    onClick={toggleMicrophone}
                    className={`p-3 rounded-full ${isMicMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                  >
                    {isMicMuted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    )}
                  </button>
                  <button 
                    onClick={toggleVideo}
                    className={`p-3 rounded-full ${isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                  >
                    {isVideoOff ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                  <button 
                    onClick={handleEndVideoCall}
                    className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* After the input area or video call controls, add this footer */}
                <div 
                  className="py-2 px-4 text-center text-xs border-t"
                  style={{ borderColor: 'rgba(0,0,0,0.1)' }}
                >
                  <span className="inline-flex items-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-3 w-3 mr-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      style={{ color: primaryColor }}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13 10V3L4 14h7v7l9-11h-7z" 
                      />
                    </svg>
                    <span className="mr-1">Powered by</span>
                    <span 
                      className="font-semibold"
                      style={{ color: primaryColor }}
                    >
                      ViewPro
                    </span>
                  </span>
                </div>
              </div>
            ) : (
              <>
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

                {showPreChat ? (
                  <div className="p-4 flex-1 overflow-y-auto">
                    <h3 className="font-medium text-gray-900 mb-2">Before we start chatting</h3>
                    <p className="text-sm text-gray-600 mb-4">Please provide your information so we can better assist you.</p>
                    
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                        {error}
                      </div>
                    )}
                    
                    <form onSubmit={handlePreChatSubmit}>
                      <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={userInfo.name}
                          onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-opacity-50"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={userInfo.email}
                          onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-opacity-50"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full p-2 rounded-md text-white font-medium flex justify-center items-center"
                        style={{ backgroundColor: primaryColor }}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Connecting...
                          </>
                        ) : (
                          'Start Chat'
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    <div className={`flex-1 p-4 overflow-y-auto ${isMobile ? 'h-[calc(100vh-144px)]' : ''}`}>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.sender === 'agent' && (
                            <div className="flex-shrink-0 mr-2">
                              {logoUrl ? (
                                <img src={logoUrl} alt={currentAgentName} className="w-8 h-8 rounded-full" />
                              ) : (
                                <div 
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          )}
                          <div className={`max-w-[75%] ${message.sender === 'user' ? 'order-1' : 'order-2'}`}>
                            <div
                              className={`px-4 py-2 rounded-lg ${
                                message.sender === 'user'
                                  ? 'bg-primary text-white rounded-br-none'
                                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
                              }`}
                              style={message.sender === 'user' ? { backgroundColor: primaryColor } : {}}
                            >
                              {message.text}
                            </div>
                            <div className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input area - disable if chat has ended */}
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
                            className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-opacity-50"
                            style={{ backgroundColor: 'white' }}
                            disabled={chatEnded}
                          />
                          <button
                            onClick={handleSendMessage}
                            className="p-2 rounded-r-md text-white"
                            style={{ backgroundColor: primaryColor }}
                            disabled={chatEnded}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* After the input area or video call controls, add this footer */}
                    <div 
                      className="py-2 px-4 text-center text-xs border-t"
                      style={{ borderColor: 'rgba(0,0,0,0.1)' }}
                    >
                      <span className="inline-flex items-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-3 w-3 mr-1" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                          style={{ color: primaryColor }}
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M13 10V3L4 14h7v7l9-11h-7z" 
                          />
                        </svg>
                        <span className="mr-1">Powered by</span>
                        <span 
                          className="font-semibold"
                          style={{ color: primaryColor }}
                        >
                          ViewPro
                        </span>
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat button */}
      {(!isOpen || !isMobile) && (
        <button
          onClick={toggleWidget}
          className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg focus:outline-none"
          style={{ backgroundColor: primaryColor, color: secondaryColor }}
        >
          <AnimatePresence initial={false}>
            {isOpen ? (
              <motion.svg
                key="close"
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </motion.svg>
            ) : (
              <motion.svg
                key="chat"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>
      )}
    </div>
  );
};

export default ChatWidget; 