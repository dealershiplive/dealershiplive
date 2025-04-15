import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useSettings } from '../../contexts/SettingsContext';
import { toast } from 'react-hot-toast';

interface AgentLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AgentLayout({ children, title }: AgentLayoutProps) {
  const { platformName } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();

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
  }, [router]);

  const handleLogout = () => {
    // Update agent status to offline before logging out
    if (user && isOnline) {
      fetch('/api/agent/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          agentId: user.id,
          isOnline: false 
        }),
      }).catch(error => {
        console.error('Error updating status:', error);
      });
    }
    
    // Clear local storage and redirect to login
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>{title || `Agent Dashboard | ${platformName}`}</title>
      </Head>
      <div className="h-screen flex overflow-hidden bg-gray-100">
        {/* Mobile sidebar */}
        <div className={`md:hidden ${isSidebarOpen ? 'fixed inset-0 flex z-40' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-primary">{platformName}</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                <NavItems currentPath={router.pathname} />
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex-shrink-0 group block">
                <div className="flex items-center">
                  <div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-500 text-white">
                      {user.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">{user.name || 'Agent'}</p>
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'} mr-1`}></div>
                      <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                        {isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Static sidebar for desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                  <h1 className="text-xl font-bold text-primary">{platformName}</h1>
                </div>
                <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                  <NavItems currentPath={router.pathname} />
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex-shrink-0 w-full group block">
                  <div className="flex items-center">
                    <div>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-500 text-white">
                        {user.name?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{user.name || 'Agent'}</p>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'} mr-1`}></div>
                        <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                          {isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
            <button
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} {platformName}. All rights reserved.
          </footer>
        </div>
      </div>
    </>
  );
}

function NavItems({ currentPath }: { currentPath: string }) {
  const navItems = [
    { name: 'Dashboard', href: '/agent/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Conversations', href: '/agent/conversations', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { name: 'Call History', href: '/agent/calls', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
    { name: 'Profile', href: '/agent/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  return (
    <>
      {navItems.map((item) => {
        const isActive = currentPath.startsWith(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              isActive
                ? 'bg-gray-100 text-primary'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <svg
              className={`mr-3 h-5 w-5 ${
                isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.name}
          </Link>
        );
      })}
      <button
        onClick={() => {
          // Handle logout
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          window.location.href = '/login';
        }}
        className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full text-left"
      >
        <svg
          className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    </>
  );
}