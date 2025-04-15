import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  userRole?: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT';
  userName?: string;
}

export default function Layout({ children, title, userRole, userName }: LayoutProps) {
  const getHeaderColor = () => {
    switch (userRole) {
      case 'SUPER_ADMIN': return 'bg-primary';
      case 'ADMIN': return 'bg-info';
      case 'AGENT': return 'bg-success';
      default: return 'bg-gray-800';
    }
  };

  const getRoleName = () => {
    switch (userRole) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'ADMIN': return 'Client Admin';
      case 'AGENT': return 'Support Agent';
      default: return '';
    }
  };

  return (
    <>
      <Head>
        <title>{title || 'SaaS Support Platform'}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Header */}
        <header className={`${getHeaderColor()} shadow-md`}>
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-white text-xl font-bold">Support Platform</span>
                {userRole && (
                  <span className="ml-4 text-white bg-white/20 px-3 py-1 rounded-md text-sm">
                    {getRoleName()}
                  </span>
                )}
              </div>
              
              {userName && (
                <div className="flex items-center">
                  <span className="text-white mr-4">{userName}</span>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.href = '/login';
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md text-sm transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white shadow-inner py-4">
          <div className="container mx-auto px-4">
            <div className="text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} SaaS Support Platform. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 