import { useState } from 'react';
import SuperAdminLayout from '../../components/metronic/SuperAdminLayout';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Mock data for support tickets
const mockTickets = [
  {
    id: '1',
    clientName: 'Tech Solutions Inc.',
    subject: 'Unable to access agent dashboard',
    status: 'OPEN',
    priority: 'HIGH',
    createdAt: '2023-10-15T14:30:00Z',
    lastUpdated: '2023-10-15T15:45:00Z',
  },
  {
    id: '2',
    clientName: 'Global Retail Co.',
    subject: 'Need to add more agent seats',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    createdAt: '2023-10-14T09:15:00Z',
    lastUpdated: '2023-10-15T11:20:00Z',
  },
  {
    id: '3',
    clientName: 'Acme Corp',
    subject: 'Billing discrepancy on latest invoice',
    status: 'OPEN',
    priority: 'MEDIUM',
    createdAt: '2023-10-13T16:45:00Z',
    lastUpdated: '2023-10-13T16:45:00Z',
  },
  {
    id: '4',
    clientName: 'Digital Innovations',
    subject: 'Widget not loading on our website',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    createdAt: '2023-10-12T11:30:00Z',
    lastUpdated: '2023-10-14T09:45:00Z',
  },
  {
    id: '5',
    clientName: 'Startup Ventures',
    subject: 'Request for custom integration',
    status: 'CLOSED',
    priority: 'LOW',
    createdAt: '2023-10-10T13:20:00Z',
    lastUpdated: '2023-10-12T16:30:00Z',
  },
];

// Mock data for ticket messages
const mockMessages = [
  {
    id: '1',
    ticketId: '1',
    sender: 'John Smith',
    senderRole: 'CLIENT_ADMIN',
    message: 'Our agents are unable to access the dashboard since this morning. We\'ve tried clearing cache and using different browsers but the issue persists.',
    createdAt: '2023-10-15T14:30:00Z',
  },
  {
    id: '2',
    ticketId: '1',
    sender: 'Support Team',
    senderRole: 'SUPPORT',
    message: 'Thank you for reporting this issue. We\'re looking into it now. Could you please provide us with your client ID and the specific error message your agents are seeing?',
    createdAt: '2023-10-15T15:15:00Z',
  },
  {
    id: '3',
    ticketId: '1',
    sender: 'John Smith',
    senderRole: 'CLIENT_ADMIN',
    message: 'Our client ID is CL-12345. The error message says "Authentication failed. Please contact your administrator."',
    createdAt: '2023-10-15T15:30:00Z',
  },
  {
    id: '4',
    ticketId: '1',
    sender: 'Support Team',
    senderRole: 'SUPPORT',
    message: 'We\'ve identified the issue with your account. There was a temporary authentication problem that has now been resolved. Please ask your agents to try logging in again. Let us know if the issue persists.',
    createdAt: '2023-10-15T15:45:00Z',
  },
];

export default function SupportPage() {
  const [tickets, setTickets] = useState(mockTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isChangingPriority, setIsChangingPriority] = useState(false);
  
  // Filter tickets based on search term and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-info/20 text-info';
      case 'IN_PROGRESS':
        return 'bg-warning/20 text-warning';
      case 'CLOSED':
        return 'bg-success/20 text-success';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };
  
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-danger/20 text-danger';
      case 'MEDIUM':
        return 'bg-warning/20 text-warning';
      case 'LOW':
        return 'bg-success/20 text-success';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const handleTicketSelect = (ticket: any) => {
    setSelectedTicket(ticket);
    // In a real app, this would fetch messages from an API
    setTicketMessages(mockMessages.filter(msg => msg.ticketId === ticket.id));
  };
  
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;
    
    setIsChangingStatus(true);
    
    try {
      // Update the ticket status
      const updatedTickets = tickets.map(ticket => 
        ticket.id === selectedTicket.id 
          ? { ...ticket, status: newStatus, lastUpdated: new Date().toISOString() } 
          : ticket
      );
      
      setTickets(updatedTickets);
      setSelectedTicket({ ...selectedTicket, status: newStatus, lastUpdated: new Date().toISOString() });
      
      // In a real app, this would send the update to an API
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      toast.success('Ticket status updated successfully!');
    } catch (error) {
      toast.error('Failed to update ticket status');
    } finally {
      setIsChangingStatus(false);
    }
  };
  
  const handlePriorityChange = async (newPriority: string) => {
    if (!selectedTicket) return;
    
    setIsChangingPriority(true);
    
    try {
      // Update the ticket priority
      const updatedTickets = tickets.map(ticket => 
        ticket.id === selectedTicket.id 
          ? { ...ticket, priority: newPriority, lastUpdated: new Date().toISOString() } 
          : ticket
      );
      
      setTickets(updatedTickets);
      setSelectedTicket({ ...selectedTicket, priority: newPriority, lastUpdated: new Date().toISOString() });
      
      // In a real app, this would send the update to an API
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      toast.success('Ticket priority updated successfully!');
    } catch (error) {
      toast.error('Failed to update ticket priority');
    } finally {
      setIsChangingPriority(false);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newMessage.trim()) return;
    
    setIsSending(true);
    
    try {
      // Create a new message
      const message = {
        id: `msg-${Date.now()}`,
        ticketId: selectedTicket.id,
        sender: 'Support Agent',
        senderRole: 'SUPPORT',
        message: newMessage,
        createdAt: new Date().toISOString(),
      };
      
      // Add the message to the list
      setTicketMessages([...ticketMessages, message]);
      
      // Clear the input
      setNewMessage('');
      
      // In a real app, this would send the message to an API
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      toast.success('Message sent successfully!');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <SuperAdminLayout title="Support | Super Admin">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Support Tickets</h1>
        
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="priorityFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priorityFilter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
          
          <div className="flex-grow md:max-w-md">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by client or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <tr 
                      key={ticket.id} 
                      className={`hover:bg-gray-50 cursor-pointer ${selectedTicket?.id === ticket.id ? 'bg-primary/5' : ''}`}
                      onClick={() => handleTicketSelect(ticket)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{ticket.clientName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{ticket.subject}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeClass(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No tickets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Ticket Details */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 flex flex-col h-[600px]">
            {selectedTicket ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-bold text-gray-900">{selectedTicket.subject}</h2>
                    <div className="flex space-x-2">
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isChangingStatus}
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                      {isChangingStatus && (
                        <svg className="animate-spin ml-1 h-3 w-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      
                      <select
                        value={selectedTicket.priority}
                        onChange={(e) => handlePriorityChange(e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <p><span className="font-medium">Client:</span> {selectedTicket.clientName}</p>
                    <p><span className="font-medium">Created:</span> {formatDate(selectedTicket.createdAt)}</p>
                    <p><span className="font-medium">Last Updated:</span> {formatDate(selectedTicket.lastUpdated)}</p>
                  </div>
                </div>
                
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                  {ticketMessages.map((message) => (
                    <div key={message.id} className={`p-3 rounded-lg ${message.senderRole === 'SUPPORT' ? 'bg-primary/10 ml-6' : 'bg-gray-200 mr-6'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{message.sender}</span>
                        <span className="text-xs text-gray-500">{formatDate(message.createdAt)}</span>
                      </div>
                      <p className="text-gray-800">{message.message}</p>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage}>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                        disabled={isSending || !newMessage.trim()}
                      >
                        {isSending ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          'Send'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a ticket to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
} 