import React, { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SuperAdminSidebar from './SuperAdminSidebar';
import { useSettings } from '../../contexts/SettingsContext';

interface SuperAdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function SuperAdminLayout({ children, title }: SuperAdminLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { platformName } = useSettings();

  useEffect(() => {
    // Check if user is logged in and has the right role
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'SUPER_ADMIN') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>{platformName} - Super Admin</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Header */}
        <header className="bg-primary shadow-md">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-white text-xl font-bold">{platformName}</span>
                <span className="ml-4 text-white bg-white/20 px-3 py-1 rounded-md text-sm">
                  Super Admin
                </span>
              </div>
              
              <div className="flex items-center">
                <div className="relative mr-4">
                  <button className="text-white hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </div>
                
                <span className="text-white mr-4">{user.name}</span>
                <button 
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    router.push('/login');
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md text-sm transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-grow flex">
          <div className="container mx-auto px-4 py-8 flex">
            {/* Sidebar */}
            <div className="mr-8">
              <SuperAdminSidebar />
            </div>
            
            {/* Content */}
            <div className="flex-grow">
              {children}
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white shadow-inner py-4">
          <div className="container mx-auto px-4">
            <div className="text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} {platformName}. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 